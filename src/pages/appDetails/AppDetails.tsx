import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ArrowBack, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, Button, IconButton, Skeleton, Typography } from "@mui/material";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { CachedImage } from "../../components/CachedImage";
import { Terminal } from "../../components/Terminal";
import { useAppScreenshots } from "../../hooks/useAppScreenshots";
import { useInstalledAppsStore } from "../../store/installedAppsStore";
import type { AppStream } from "../../types";

interface AppDetailsProps {
	app: AppStream;
	onBack: () => void;
}

export const AppDetails = ({ app, onBack }: AppDetailsProps) => {
	const { screenshots, isLoading: isLoadingScreenshots } =
		useAppScreenshots(app);
	const { isAppInstalled, setInstalledApp } = useInstalledAppsStore();
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	// Generate stable UUIDs for screenshots
	const screenshotIds = useMemo(
		() => screenshots?.map(() => uuidv4()) || [],
		[screenshots],
	);
	const [isInstalling, setIsInstalling] = useState(false);
	const [installOutput, setInstallOutput] = useState<string[]>([]);
	const [installStatus, setInstallStatus] = useState<
		"idle" | "installing" | "success" | "error"
	>("idle");

	// Check if app is already installed
	const isInstalled = isAppInstalled(app.id);

	// Escuchar eventos de instalación
	useEffect(() => {
		const unlistenOutput = listen<string>("install-output", (event) => {
			setInstallOutput((prev) => [...prev, event.payload]);
		});

		const unlistenError = listen<string>("install-error", (event) => {
			setInstallOutput((prev) => [...prev, `Error: ${event.payload}`]);
		});

		const unlistenCompleted = listen<number>("install-completed", (event) => {
			setIsInstalling(false);
			if (event.payload === 0) {
				setInstallOutput((prev) => [
					...prev,
					"",
					"✓ Instalación completada exitosamente.",
				]);
				setInstallStatus("success");
				// Mark app as installed in the store
				setInstalledApp(app.id, true);
			} else {
				setInstallOutput((prev) => [
					...prev,
					"",
					`✗ Instalación falló con código: ${event.payload}`,
				]);
				setInstallStatus("error");
			}
		});

		return () => {
			unlistenOutput.then((fn) => fn());
			unlistenError.then((fn) => fn());
			unlistenCompleted.then((fn) => fn());
		};
	}, [app.id, setInstalledApp]);

	// Función para limpiar HTML de la descripción
	const stripHtml = (html: string) => {
		const tmp = document.createElement("div");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || "";
	};

	const handlePrevImage = () => {
		if (screenshots && screenshots.length > 0) {
			setCurrentImageIndex((prev) =>
				prev === 0 ? screenshots.length - 1 : prev - 1,
			);
		}
	};

	const handleNextImage = () => {
		if (screenshots && screenshots.length > 0) {
			setCurrentImageIndex((prev) =>
				prev === screenshots.length - 1 ? 0 : prev + 1,
			);
		}
	};

	const handleInstall = async () => {
		setIsInstalling(true);
		setInstallStatus("installing");
		setInstallOutput([
			"Preparando instalación personalizada...",
			"Descargando referencia de flatpak...",
			"",
		]);

		try {
			await invoke("install_flatpak", {
				appId: app.id,
			});
		} catch (error) {
			setIsInstalling(false);
			setInstallStatus("error");
			setInstallOutput((prev) => [
				...prev,
				"",
				`✗ Error al invocar comando: ${error}`,
			]);
		}
	};

	const handleDownloadLog = async () => {
		const logContent = installOutput.join("\n");
		const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
		const defaultFileName = `install-log-${app.id}-${timestamp}.txt`;

		try {
			const filePath = await save({
				defaultPath: defaultFileName,
				filters: [
					{
						name: "Text Files",
						extensions: ["txt"],
					},
				],
			});

			if (filePath) {
				await writeTextFile(filePath, logContent);
			}
		} catch (error) {
			console.error("Error al guardar el log:", error);
		}
	};

	const handleAccept = () => {
		setInstallStatus("idle");
		setInstallOutput([]);
	};

	return (
		<Box sx={{ p: 3, minHeight: "100vh" }}>
			{/* Botón de regreso */}
			<IconButton onClick={onBack} sx={{ mb: 2 }}>
				<ArrowBack />
			</IconButton>

			{/* Sección superior: Icono, Nombre y Botón Instalar */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					mb: 4,
					pb: 3,
					borderBottom: "1px solid",
					borderColor: "divider",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					{/* Icono */}
					<Box
						sx={{
							width: 80,
							height: 80,
							borderRadius: 2,
							overflow: "hidden",
							bgcolor: "grey.800",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{app.icon ? (
							<CachedImage
								appId={app.id}
								imageUrl={app.icon}
								alt={app.name}
								variant="rounded"
								style={{
									width: "100%",
									height: "100%",
									objectFit: "cover",
								}}
							/>
						) : (
							<Typography variant="caption" color="text.secondary">
								Sin icono
							</Typography>
						)}
					</Box>

					{/* Nombre y Summary */}
					<Box>
						<Typography variant="h4" fontWeight="bold">
							{app.name}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{app.summary}
						</Typography>
					</Box>
				</Box>

				{/* Install Button */}
				<Button
					variant="contained"
					size="large"
					onClick={handleInstall}
					disabled={
						isInstalled ||
						installStatus === "installing" ||
						installStatus === "success"
					}
					sx={{
						px: 4,
						py: 1.5,
						fontSize: "1rem",
						fontWeight: "bold",
						bgcolor:
							isInstalled || installStatus === "success"
								? "success.main"
								: installStatus === "installing"
									? "grey.600"
									: "primary.main",
						"&:hover": {
							bgcolor:
								isInstalled || installStatus === "success"
									? "success.dark"
									: installStatus === "installing"
										? "grey.600"
										: "primary.dark",
						},
						"&.Mui-disabled": {
							bgcolor:
								isInstalled || installStatus === "success"
									? "success.main"
									: "grey.600",
							color: "white",
						},
					}}
				>
					{isInstalled || installStatus === "success"
						? "Installed"
						: installStatus === "installing"
							? "Installing..."
							: "Instalar"}
				</Button>
			</Box>

			{/* Sección de Screenshots - Carrusel, Terminal o Resultado */}
			<Box sx={{ mb: 4 }}>
				{installStatus === "installing" ? (
					<>
						<Typography variant="h6" gutterBottom textAlign="center">
							Instalación en progreso
						</Typography>
						<Terminal output={installOutput} isRunning={isInstalling} />
					</>
				) : installStatus === "success" || installStatus === "error" ? (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 3,
							p: 4,
							minHeight: 500,
						}}
					>
						{/* Animación */}
						<Box sx={{ width: 300, height: 300 }}>
							<DotLottieReact
								key={installStatus}
								src={
									installStatus === "success"
										? "/src/assets/animations/success.lottie"
										: "/src/assets/animations/Error.lottie"
								}
								loop={false}
								autoplay={true}
							/>
						</Box>

						{/* Mensaje */}
						<Typography variant="h5" textAlign="center">
							{installStatus === "success"
								? "¡Instalación completada exitosamente!"
								: "Error en la instalación"}
						</Typography>

						{/* Botones */}
						<Box sx={{ display: "flex", gap: 2 }}>
							<Button
								variant="outlined"
								onClick={handleDownloadLog}
								sx={{ px: 3 }}
							>
								Obtener log
							</Button>
							<Button variant="contained" onClick={handleAccept} sx={{ px: 3 }}>
								Aceptar
							</Button>
						</Box>
					</Box>
				) : (
					<>
						<Typography variant="h6" gutterBottom textAlign="center">
							Capturas de pantalla
						</Typography>
						{isLoadingScreenshots ? (
							<Box
								sx={{
									position: "relative",
									width: "100%",
									maxWidth: 900,
									margin: "0 auto",
								}}
							>
								<Skeleton
									variant="rounded"
									sx={{
										width: "100%",
										height: 500,
									}}
									animation="wave"
								/>
							</Box>
						) : screenshots && screenshots.length > 0 ? (
							<Box
								sx={{
									position: "relative",
									width: "100%",
									maxWidth: 900,
									margin: "0 auto",
								}}
							>
								{/* Imagen actual */}
								<Box
									sx={{
										width: "100%",
										height: 500,
										bgcolor: "grey.900",
										borderRadius: 2,
										overflow: "hidden",
										position: "relative",
									}}
								>
									{screenshots.map((screenshot, index) => {
										// Buscar el tamaño más grande o el primero disponible
										const largestSize = screenshot.sizes.reduce(
											(prev, current) =>
												Number.parseInt(prev.width, 10) >
												Number.parseInt(current.width, 10)
													? prev
													: current,
										);
										return (
											<Box
												key={screenshotIds[index]}
												sx={{
													position: "absolute",
													top: 0,
													left: 0,
													width: "100%",
													height: "100%",
													display: index === currentImageIndex ? "flex" : "none",
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												<CachedImage
													appId={app.id}
													imageUrl={largestSize.src}
													alt={`Screenshot ${index + 1}`}
													cacheKey={`${app.id}:::${index + 1}`}
													variant="rounded"
													style={{
														width: "100%",
														height: "100%",
														maxWidth: "100%",
														maxHeight: "100%",
														objectFit: "contain",
													}}
												/>
											</Box>
										);
									})}
								</Box>

								{/* Controles del carrusel */}
								{screenshots.length > 1 && (
									<>
										<IconButton
											onClick={handlePrevImage}
											sx={{
												position: "absolute",
												left: 10,
												top: "50%",
												transform: "translateY(-50%)",
												bgcolor: "rgba(0, 0, 0, 0.5)",
												color: "white",
												"&:hover": {
													bgcolor: "rgba(0, 0, 0, 0.7)",
												},
											}}
										>
											<ChevronLeft />
										</IconButton>
										<IconButton
											onClick={handleNextImage}
											sx={{
												position: "absolute",
												right: 10,
												top: "50%",
												transform: "translateY(-50%)",
												bgcolor: "rgba(0, 0, 0, 0.5)",
												color: "white",
												"&:hover": {
													bgcolor: "rgba(0, 0, 0, 0.7)",
												},
											}}
										>
											<ChevronRight />
										</IconButton>

										{/* Indicadores */}
										<Box
											sx={{
												display: "flex",
												justifyContent: "center",
												gap: 1,
												mt: 2,
											}}
										>
											{screenshots.map((_, index) => (
												<Box
													key={uuidv4()}
													onClick={() => setCurrentImageIndex(index)}
													sx={{
														width: 8,
														height: 8,
														borderRadius: "50%",
														bgcolor:
															index === currentImageIndex
																? "primary.main"
																: "grey.600",
														cursor: "pointer",
														transition: "all 0.3s",
														"&:hover": {
															bgcolor:
																index === currentImageIndex
																	? "primary.main"
																	: "grey.500",
														},
													}}
												/>
											))}
										</Box>
									</>
								)}
							</Box>
						) : (
							<Box
								sx={{
									textAlign: "center",
									py: 4,
									color: "text.secondary",
								}}
							>
								<Typography>No hay capturas de pantalla disponibles</Typography>
							</Box>
						)}
					</>
				)}
			</Box>

			{/* Descripción */}
			{app.description && (
				<Box sx={{ mt: 4 }}>
					<Typography variant="h6" gutterBottom>
						Acerca de esta aplicación
					</Typography>
					<Typography variant="body1" color="text.secondary">
						{stripHtml(app.description)}
					</Typography>
				</Box>
			)}
		</Box>
	);
};
