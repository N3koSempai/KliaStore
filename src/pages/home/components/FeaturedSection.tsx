import { Box, Typography } from "@mui/material";

export const FeaturedSection = () => {
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
				<Typography variant="body1" color="text.secondary">
					Carrusel de destacados
				</Typography>
			</Box>
		</Box>
	);
};
