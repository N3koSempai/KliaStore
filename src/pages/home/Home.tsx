import { Box, Container } from "@mui/material";
import type { AppStream } from "../../types";
import { AppsOfTheDaySection } from "./components/AppsOfTheDaySection";
import { CategoriesSection } from "./components/CategoriesSection";
import { FeaturedSection } from "./components/FeaturedSection";

interface HomeProps {
	onAppSelect: (app: AppStream) => void;
}

export const Home = ({ onAppSelect }: HomeProps) => {
	return (
		<Container maxWidth="xl">
			<Box sx={{ py: 4 }}>
				<FeaturedSection />
				<AppsOfTheDaySection onAppSelect={onAppSelect} />
				<CategoriesSection />
			</Box>
		</Container>
	);
};
