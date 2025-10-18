import {
	Box,
	Card,
	CardContent,
	Skeleton,
	Typography,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { CachedImage } from "../../../components/CachedImage";
import { useAppsOfTheWeek } from "../../../hooks/useAppsOfTheWeek";
import type { AppStream } from "../../../types";

interface AppsOfTheDaySectionProps {
	onAppSelect: (app: AppStream) => void;
}

export const AppsOfTheDaySection = ({
	onAppSelect,
}: AppsOfTheDaySectionProps) => {
	const { data, isLoading, error } = useAppsOfTheWeek();

	return (
		<Box sx={{ mb: 4 }}>
			<Typography variant="h5" gutterBottom>
				Aplicaciones de la semana
			</Typography>

			{error && (
				<Typography color="error">
					Error al cargar las aplicaciones: {error.message}
				</Typography>
			)}

			<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
				{isLoading || !data
					? Array.from(new Array(6)).map((_) => (
							<Box key={uuidv4()} sx={{ flex: "0 0 auto" }}>
								<Card
									sx={{
										height: 240,
										minWidth: 200,
										maxWidth: 250,
										display: "flex",
										flexDirection: "column",
									}}
								>
									<Skeleton
										variant="rectangular"
										height={140}
										sx={{ flexShrink: 0 }}
									/>
									<CardContent
										sx={{
											flexGrow: 1,
											display: "flex",
											flexDirection: "column",
											justifyContent: "space-between",
										}}
									>
										<Skeleton variant="text" width="100%" />
										<Skeleton variant="text" width="40%" />
									</CardContent>
								</Card>
							</Box>
						))
					: [
							...data.map((app) => (
								<Box key={app.app_id} sx={{ flex: "0 0 auto" }}>
									<Card
										onClick={() => app.appStream && onAppSelect(app.appStream)}
										sx={{
											cursor: "pointer",
											"&:hover": { boxShadow: 3 },
											height: 240,
											minWidth: 200,
											maxWidth: 250,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<Box
											sx={{
												height: 140,
												bgcolor: "grey.700",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												flexShrink: 0,
												overflow: "hidden",
											}}
										>
											{app.icon ? (
												<CachedImage
													appId={app.app_id}
													imageUrl={app.icon}
													alt={app.name || app.app_id}
													style={{
														width: "100%",
														height: "100%",
														objectFit: "contain",
													}}
												/>
											) : (
												<Typography variant="caption" color="text.secondary">
													Sin imagen
												</Typography>
											)}
										</Box>
										<CardContent
											sx={{
												flexGrow: 1,
												display: "flex",
												flexDirection: "column",
												justifyContent: "space-between",
											}}
										>
											<Typography
												variant="body2"
												noWrap
												title={app.name || app.app_id}
											>
												{app.name || app.app_id}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												#{app.position}
											</Typography>
										</CardContent>
									</Card>
								</Box>
							)),
							// Promoted card
							<Box key="promoted" sx={{ flex: "0 0 auto" }}>
								<Card
									sx={{
										cursor: "pointer",
										"&:hover": { boxShadow: 3 },
										height: 240,
										minWidth: 200,
										maxWidth: 250,
										display: "flex",
										flexDirection: "column",
										border: "2px dashed",
										borderColor: "primary.main",
										bgcolor: "background.paper",
									}}
								>
									<Box
										sx={{
											height: 140,
											bgcolor: "grey.100",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
										}}
									>
										<Typography
											variant="h3"
											color="primary.main"
											sx={{ opacity: 0.3 }}
										>
											+
										</Typography>
									</Box>
									<CardContent
										sx={{
											flexGrow: 1,
											display: "flex",
											flexDirection: "column",
											justifyContent: "center",
											textAlign: "center",
										}}
									>
										<Typography variant="body2" color="text.secondary">
											Want your app here?
										</Typography>
										<Typography variant="body2" color="primary">
											Contact us
										</Typography>
									</CardContent>
								</Card>
							</Box>,
						]}
			</Box>
		</Box>
	);
};
