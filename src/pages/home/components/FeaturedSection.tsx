import {
	Box,
	Card,
	CardContent,
	Skeleton,
	Typography,
} from "@mui/material";
import { CachedImage } from "../../../components/CachedImage";
import { useAppOfTheDay } from "../../../hooks/useAppOfTheDay";
import type { AppStream } from "../../../types";

interface FeaturedSectionProps {
	onAppSelect: (app: AppStream) => void;
}

export const FeaturedSection = ({ onAppSelect }: FeaturedSectionProps) => {
	const { data: appOfTheDay, isLoading, error } = useAppOfTheDay();

	if (isLoading) {
		return (
			<Box sx={{ mb: 4 }}>
				<Typography variant="h5" gutterBottom>
					Destacados
				</Typography>
				<Card
					sx={{
						height: 300,
						borderRadius: 2,
						display: "flex",
						overflow: "hidden",
					}}
				>
					<Skeleton
						variant="rectangular"
						width={200}
						height={300}
						sx={{ flexShrink: 0 }}
					/>
					<CardContent
						sx={{
							flex: 1,
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
						}}
					>
						<Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
						<Skeleton variant="text" width="70%" height={48} sx={{ mb: 2 }} />
						<Skeleton variant="text" width="90%" />
						<Skeleton variant="text" width="85%" />
					</CardContent>
				</Card>
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ mb: 4 }}>
				<Typography variant="h5" gutterBottom>
					Destacados
				</Typography>
				<Box
					sx={{
						height: 300,
						bgcolor: "grey.200",
						borderRadius: 2,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Typography variant="body1" color="error">
						Error al cargar la aplicación del día
					</Typography>
				</Box>
			</Box>
		);
	}

	return (
		<Box sx={{ mb: 4 }}>
			<Typography variant="h5" gutterBottom>
				Destacados
			</Typography>
			<Card
				onClick={() =>
					appOfTheDay?.appStream && onAppSelect(appOfTheDay.appStream)
				}
				sx={{
					height: 300,
					borderRadius: 2,
					display: "flex",
					position: "relative",
					overflow: "hidden",
					cursor: "pointer",
					"&:hover": { boxShadow: 3 },
				}}
			>
				{appOfTheDay?.icon && appOfTheDay.app_id && (
					<Box
						sx={{
							width: 200,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							p: 2,
						}}
					>
						<CachedImage
							appId={appOfTheDay.app_id}
							imageUrl={appOfTheDay.icon}
							alt={appOfTheDay.name || appOfTheDay.app_id}
							style={{
								width: "100%",
								height: "100%",
								objectFit: "contain",
							}}
						/>
					</Box>
				)}
				<CardContent
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
					}}
				>
					<Typography variant="overline" color="primary" gutterBottom>
						App del día
					</Typography>
					<Typography variant="h4" component="div" gutterBottom>
						{appOfTheDay?.name || appOfTheDay?.app_id}
					</Typography>
					{appOfTheDay?.appStream?.summary && (
						<Typography variant="body1" color="text.secondary">
							{appOfTheDay.appStream.summary}
						</Typography>
					)}
				</CardContent>
			</Card>
		</Box>
	);
};
