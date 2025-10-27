import {
	Box,
	Card,
	CardContent,
	Grid,
	Skeleton,
	Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import { useCategories } from "../../../hooks/useCategories";

interface CategoriesSectionProps {
	onCategorySelect: (categoryId: string) => void;
}

export const CategoriesSection = ({
	onCategorySelect,
}: CategoriesSectionProps) => {
	const { t } = useTranslation();
	const { data: categories, isLoading, error } = useCategories();

	return (
		<Box sx={{ mb: 4 }}>
			<Typography variant="h5" gutterBottom>
				{t("home.categories")}
			</Typography>

			{error && (
				<Typography color="error">
					{t("home.errorLoadingCategories", { error: error.message })}
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
							<Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={category}>
								<Card
									sx={{
										cursor: "pointer",
										"&:hover": {
											boxShadow: 3,
											transform: "translateY(-2px)",
											transition: "all 0.2s",
										},
										height: "100%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										p: 2,
										minHeight: 80,
									}}
									onClick={() => onCategorySelect(category)}
								>
									<Typography
										variant="body2"
										textAlign="center"
										textTransform="capitalize"
										sx={{ width: "100%", fontWeight: 500 }}
									>
										{category}
									</Typography>
								</Card>
							</Grid>
						))}
			</Grid>
		</Box>
	);
};
