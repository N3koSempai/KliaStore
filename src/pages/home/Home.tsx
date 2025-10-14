import { Container, Box } from "@mui/material";
import { FeaturedSection } from "./components/FeaturedSection";
import { AppsOfTheDaySection } from "./components/AppsOfTheDaySection";
import { CategoriesSection } from "./components/CategoriesSection";
import type { AppStream } from "../../types";

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
