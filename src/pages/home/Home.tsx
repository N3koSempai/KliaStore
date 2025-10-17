import { Box, Container } from "@mui/material";
import type { AppStream } from "../../types";
import { AppsOfTheDaySection } from "./components/AppsOfTheDaySection";
import { CategoriesSection } from "./components/CategoriesSection";
import { FeaturedSection } from "./components/FeaturedSection";

interface HomeProps {
	onAppSelect: (app: AppStream) => void;
	onCategorySelect: (categoryId: string) => void;
}

export const Home = ({ onAppSelect, onCategorySelect }: HomeProps) => {
	return (
		<Container maxWidth="xl">
			<Box sx={{ py: 4 }}>
				<FeaturedSection onAppSelect={onAppSelect} />
				<AppsOfTheDaySection onAppSelect={onAppSelect} />
				<CategoriesSection onCategorySelect={onCategorySelect} />
			</Box>
		</Container>
	);
};
