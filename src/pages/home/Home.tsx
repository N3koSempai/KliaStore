import AppsIcon from "@mui/icons-material/Apps";
import {
	Box,
	Button,
	Card,
	CardContent,
	Container,
	Skeleton,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import { AppSearchBar } from "../../components/AppSearchBar";
import { CachedImage } from "../../components/CachedImage";
import type { AppStream, CategoryApp } from "../../types";
import { AppsOfTheDaySection } from "./components/AppsOfTheDaySection";
import { CategoriesSection } from "./components/CategoriesSection";
import { FeaturedSection } from "./components/FeaturedSection";

interface HomeProps {
	onAppSelect: (app: AppStream) => void;
	onCategorySelect: (categoryId: string) => void;
	onMyAppsClick: () => void;
}

export const Home = ({ onAppSelect, onCategorySelect, onMyAppsClick }: HomeProps) => {
	const { t } = useTranslation();
	const [searchResults, setSearchResults] = useState<CategoryApp[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearch = (query: string, results: CategoryApp[]) => {
		setSearchQuery(query);
		setSearchResults(results);
	};

	const handleAppClick = (categoryApp: CategoryApp) => {
		const appStream: AppStream = {
			id: categoryApp.app_id,
			name: categoryApp.name,
			summary: categoryApp.summary,
			description: categoryApp.description,
			icon: categoryApp.icon,
		};
		onAppSelect(appStream);
	};

	const showSearchResults = searchQuery.trim().length > 0;

	return (
		<Container maxWidth="xl">
			<Box sx={{ py: 4, minHeight: "100vh" }}>
				{/* Search Bar with My Apps Button - Always visible */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						gap: 2,
						mb: 4,
						mt: 2,
					}}
				>
					<Button
						variant="outlined"
						startIcon={<AppsIcon />}
						onClick={onMyAppsClick}
						sx={{
							borderRadius: 3,
							px: 3,
							py: 1.5,
							fontWeight: "bold",
							borderColor: "rgba(255, 255, 255, 0.1)",
							"&:hover": {
								borderColor: "primary.main",
								backgroundColor: "rgba(25, 118, 210, 0.04)",
							},
						}}
					>
						{t("home.myApps")}
					</Button>
					<AppSearchBar onSearch={handleSearch} onLoading={setIsSearching} />
				</Box>

				{/* Search Results Section */}
				{showSearchResults && (
					<Box sx={{ mb: 4 }}>
						<Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
							{isSearching
								? t("home.searching")
								: t("home.searchResults", { query: searchQuery })}
						</Typography>

						{/* Apps grid */}
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: {
									xs: "1fr",
									sm: "repeat(2, 1fr)",
									md: "repeat(3, 1fr)",
									lg: "repeat(4, 1fr)",
								},
								gap: 2,
								width: "100%",
								boxSizing: "border-box",
							}}
						>
							{isSearching
								? Array.from(new Array(12)).map(() => (
										<Box key={uuidv4()}>
											<Card
												sx={{
													height: "100%",
													display: "flex",
													flexDirection: "column",
													boxSizing: "border-box",
												}}
											>
												<Box
													sx={{
														p: 2,
														display: "flex",
														gap: 2,
														minHeight: 100,
														alignItems: "center",
													}}
												>
													<Skeleton
														variant="rectangular"
														width={64}
														height={64}
														sx={{ borderRadius: 2, flexShrink: 0 }}
													/>
													<Box sx={{ flexGrow: 1, minWidth: 0 }}>
														<Skeleton variant="text" sx={{ mb: 0.5 }} />
														<Skeleton variant="text" width="50%" />
													</Box>
												</Box>
												<CardContent sx={{ flexGrow: 1, pt: 1 }}>
													<Skeleton variant="text" />
													<Skeleton variant="text" width="90%" />
												</CardContent>
											</Card>
										</Box>
									))
								: searchResults.map((app) => (
										<Box
											key={app.app_id}
											sx={{ minWidth: 0, overflow: "hidden" }}
										>
											<Card
												sx={{
													cursor: "pointer",
													"&:hover": { boxShadow: 6 },
													height: "100%",
													display: "flex",
													flexDirection: "column",
													transition: "box-shadow 0.3s",
													boxSizing: "border-box",
													minWidth: 0,
													overflow: "hidden",
												}}
												onClick={() => handleAppClick(app)}
											>
												<Box
													sx={{
														p: 2,
														display: "flex",
														alignItems: "center",
														gap: 2,
														minHeight: 100,
														bgcolor: "background.paper",
													}}
												>
													<Box
														sx={{
															width: 64,
															height: 64,
															flexShrink: 0,
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
																appId={app.app_id}
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
															<Typography
																variant="caption"
																color="text.secondary"
															>
																{t("home.noIcon")}
															</Typography>
														)}
													</Box>

													<Box sx={{ flexGrow: 1, minWidth: 0 }}>
														<Typography
															variant="body1"
															fontWeight="bold"
															noWrap
															sx={{ mb: 0.5 }}
														>
															{app.name}
														</Typography>
														<Typography
															variant="caption"
															color="text.secondary"
															noWrap
														>
															{app.developer_name}
														</Typography>
													</Box>
												</Box>

												<CardContent sx={{ flexGrow: 1, pt: 1 }}>
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{
															display: "-webkit-box",
															WebkitLineClamp: 2,
															WebkitBoxOrient: "vertical",
															overflow: "hidden",
															minHeight: "2.5em",
														}}
													>
														{app.summary}
													</Typography>
												</CardContent>
											</Card>
										</Box>
									))}
						</Box>

						{/* No results message */}
						{!isSearching && searchResults.length === 0 && (
							<Box sx={{ textAlign: "center", py: 8 }}>
								<Typography variant="h6" color="text.secondary">
									{t("home.noResultsFor", { query: searchQuery })}
								</Typography>
							</Box>
						)}
					</Box>
				)}

				{/* Main content sections - show when not searching */}
				{!showSearchResults && (
					<>
						<FeaturedSection onAppSelect={onAppSelect} />
						<AppsOfTheDaySection onAppSelect={onAppSelect} />
						<CategoriesSection onCategorySelect={onCategorySelect} />
					</>
				)}
			</Box>
		</Container>
	);
};
