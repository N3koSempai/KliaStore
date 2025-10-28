import { ArrowBack, Description } from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	Container,
	Dialog,
	DialogContent,
	IconButton,
	Typography,
} from "@mui/material";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { CachedImage } from "../../components/CachedImage";
import { ReleaseNotesModal } from "../../components/ReleaseNotesModal";
import { Terminal } from "../../components/Terminal";
import type { UpdateAvailableInfo } from "../../store/installedAppsStore";
import { useInstalledAppsStore } from "../../store/installedAppsStore";

interface UpdateAvailableRust {
	app_id: string;
	new_version: string;
	branch: string;
}

interface MyAppsProps {
	onBack: () => void;
}

export const MyApps = ({ onBack }: MyAppsProps) => {
	const { getInstalledAppsInfo, hasUpdate, getUpdateInfo, setAvailableUpdates } =
		useInstalledAppsStore();
	const installedApps = getInstalledAppsInfo();
	const [selectedAppForNotes, setSelectedAppForNotes] = useState<string | null>(
		null,
	);
	const [updatingApp, setUpdatingApp] = useState<string | null>(null);
	const [updateOutput, setUpdateOutput] = useState<string[]>([]);
	const [isUpdating, setIsUpdating] = useState(false);

	const reloadAvailableUpdates = useCallback(async () => {
		try {
			const updates = await invoke<UpdateAvailableRust[]>(
				"get_available_updates",
			);
			const updatesInfo: UpdateAvailableInfo[] = updates.map((update) => ({
				appId: update.app_id,
				newVersion: update.new_version,
				branch: update.branch,
			}));
			setAvailableUpdates(updatesInfo);
		} catch (error) {
			console.error("Error reloading available updates:", error);
		}
	}, [setAvailableUpdates]);

	// Listen to update events
	useEffect(() => {
		const unlistenOutput = listen<string>("install-output", (event) => {
			setUpdateOutput((prev) => [...prev, event.payload]);
		});

		const unlistenError = listen<string>("install-error", (event) => {
			setUpdateOutput((prev) => [...prev, `Error: ${event.payload}`]);
		});

		const unlistenCompleted = listen<number>("install-completed", async (event) => {
			setIsUpdating(false);
			if (event.payload === 0) {
				setUpdateOutput((prev) => [
					...prev,
					"",
					"✓ Actualización completada exitosamente.",
					"Recargando lista de actualizaciones...",
				]);
				// Reload available updates after successful update
				await reloadAvailableUpdates();
				setUpdateOutput((prev) => [
					...prev,
					"✓ Lista actualizada.",
				]);
			} else {
				setUpdateOutput((prev) => [
					...prev,
					"",
					`✗ Actualización falló con código: ${event.payload}`,
				]);
			}
		});

		return () => {
			unlistenOutput.then((fn) => fn());
			unlistenError.then((fn) => fn());
			unlistenCompleted.then((fn) => fn());
		};
	}, [reloadAvailableUpdates]);

	const handleCloseModal = () => {
		setSelectedAppForNotes(null);
	};

	const handleUpdate = async (appId: string) => {
		setUpdatingApp(appId);
		setIsUpdating(true);
		setUpdateOutput([`Preparando actualización de ${appId}...`, ""]);

		try {
			await invoke("update_flatpak", { appId });
		} catch (error) {
			setIsUpdating(false);
			setUpdateOutput((prev) => [
				...prev,
				"",
				`✗ Error al invocar comando: ${error}`,
			]);
		}
	};

	const handleCloseUpdateDialog = () => {
		setUpdatingApp(null);
		setUpdateOutput([]);
	};

	// Get selected app info for modal
	const selectedApp = installedApps.find(
		(app) => app.appId === selectedAppForNotes,
	);
	const updateInfo = selectedAppForNotes
		? getUpdateInfo(selectedAppForNotes)
		: undefined;

	return (
		<Container maxWidth="xl">
			<Box sx={{ py: 4, minHeight: "100vh" }}>
				{/* Back button */}
				<Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
					<IconButton onClick={onBack}>
						<ArrowBack />
					</IconButton>
					<Typography variant="h4" fontWeight="bold">
						My Apps
					</Typography>
				</Box>

				{/* Installed apps count */}
				<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
					{installedApps.length}{" "}
					{installedApps.length === 1 ? "aplicación instalada" : "aplicaciones instaladas"}
				</Typography>

				{/* Apps grid */}
				{installedApps.length > 0 ? (
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(2, 1fr)",
								md: "repeat(3, 1fr)",
								lg: "repeat(4, 1fr)",
								xl: "repeat(5, 1fr)",
							},
							gap: 2,
							width: "100%",
							boxSizing: "border-box",
						}}
					>
						{installedApps.map((app) => (
							<Card
								key={app.appId}
								sx={{
									height: "100%",
									display: "flex",
									flexDirection: "column",
									boxSizing: "border-box",
									minWidth: 0,
									overflow: "hidden",
									transition: "box-shadow 0.3s",
									"&:hover": { boxShadow: 6 },
								}}
							>
								<Box
									sx={{
										p: 2,
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										gap: 2,
										minHeight: 150,
										bgcolor: "background.paper",
									}}
								>
									{/* App Icon */}
									<Box
										sx={{
											width: 80,
											height: 80,
											flexShrink: 0,
											borderRadius: 2,
											overflow: "hidden",
											bgcolor: "grey.800",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<CachedImage
											appId={app.appId}
											imageUrl={`https://dl.flathub.org/repo/appstream/x86_64/icons/128x128/${app.appId}.png`}
											alt={app.name}
											variant="rounded"
											style={{
												width: "100%",
												height: "100%",
												objectFit: "cover",
											}}
										/>
									</Box>

									{/* App Name */}
									<Typography
										variant="body1"
										fontWeight="bold"
										textAlign="center"
										sx={{
											overflow: "hidden",
											textOverflow: "ellipsis",
											display: "-webkit-box",
											WebkitLineClamp: 2,
											WebkitBoxOrient: "vertical",
											minHeight: "2.5em",
										}}
									>
										{app.name}
									</Typography>
								</Box>

								<CardContent sx={{ flexGrow: 1, pt: 1 }}>
									{/* App ID */}
									<Typography
										variant="caption"
										color="text.secondary"
										sx={{
											display: "block",
											mb: 1,
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
										}}
									>
										{app.appId}
									</Typography>

									{/* Version and Update Button */}
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											gap: 1,
										}}
									>
										<Typography
											variant="caption"
											color="primary"
											sx={{
												fontWeight: "bold",
											}}
										>
											v{app.version}
										</Typography>

										{hasUpdate(app.appId) && (
											<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
												{/* Release Notes Icon */}
												<IconButton
													size="small"
													onClick={() => setSelectedAppForNotes(app.appId)}
													sx={{
														p: 0.5,
														"&:hover": {
															color: "primary.main",
														},
													}}
												>
													<Description fontSize="small" />
												</IconButton>

												{/* Update Button */}
												<Button
													variant="contained"
													size="small"
													onClick={() => handleUpdate(app.appId)}
													disabled={isUpdating && updatingApp === app.appId}
													sx={{
														minWidth: "auto",
														px: 1.5,
														py: 0.5,
														fontSize: "0.7rem",
														textTransform: "none",
													}}
												>
													{isUpdating && updatingApp === app.appId
														? "Updating..."
														: "Update"}
												</Button>
											</Box>
										)}
									</Box>
								</CardContent>
							</Card>
						))}
					</Box>
				) : (
					<Box
						sx={{
							textAlign: "center",
							py: 8,
						}}
					>
						<Typography variant="h6" color="text.secondary">
							No tienes aplicaciones instaladas
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
							Instala aplicaciones desde la tienda para verlas aquí
						</Typography>
					</Box>
				)}

				{/* Release Notes Modal */}
				{selectedApp && updateInfo && (
					<ReleaseNotesModal
						appId={selectedApp.appId}
						appName={selectedApp.name}
						currentVersion={selectedApp.version}
						newVersion={updateInfo.newVersion}
						open={selectedAppForNotes !== null}
						onClose={handleCloseModal}
					/>
				)}

				{/* Update Dialog */}
				<Dialog
					open={updatingApp !== null}
					onClose={!isUpdating ? handleCloseUpdateDialog : undefined}
					maxWidth="md"
					fullWidth
				>
					<DialogContent>
						<Typography variant="h6" gutterBottom>
							Actualizando {updatingApp}
						</Typography>
						<Terminal output={updateOutput} isRunning={isUpdating} />
						{!isUpdating && (
							<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
								<Button variant="contained" onClick={handleCloseUpdateDialog}>
									Cerrar
								</Button>
							</Box>
						)}
					</DialogContent>
				</Dialog>
			</Box>
		</Container>
	);
};
