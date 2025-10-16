import {
	Box,
	Card,
	CardContent,
	Grid,
	Skeleton,
	Typography,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { useCategories } from "../../../hooks/useCategories";

export const CategoriesSection = () => {
	const { data: categories, isLoading, error } = useCategories();

	return (
		<Box sx={{ mb: 4 }}>
			<Typography variant="h5" gutterBottom>
				Categorías
			</Typography>

			{error && (
				<Typography color="error">
					Error al cargar las categorías: {error.message}
				</Typography>
			)}

			<Grid container spacing={2}>
				{isLoading
					? Array.from(new Array(10)).map((_) => (
							<Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={uuidv4()}>
								<Card sx={{ height: "100%" }}>
									<Skeleton variant="rectangular" height={120} />
									<CardContent>
										<Skeleton variant="text" />
									</CardContent>
								</Card>
							</Grid>
						))
					: categories?.map((category) => (
							<Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={category}>
								<Card
									sx={{
										cursor: "pointer",
										"&:hover": { boxShadow: 3 },
										height: "100%",
										display: "flex",
										flexDirection: "column",
									}}
								>
									<Box
										sx={{
											height: 120,
											bgcolor: "grey.300",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
										}}
									>
										<Typography variant="caption" color="text.secondary">
											Imagen
										</Typography>
									</Box>
									<CardContent
										sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
									>
										<Typography
											variant="body1"
											textAlign="center"
											textTransform="capitalize"
											sx={{ width: "100%" }}
										>
											{category}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						))}
			</Grid>
		</Box>
	);
};
