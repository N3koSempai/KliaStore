import { Container, Box } from "@mui/material";
import { FeaturedSection } from "./components/FeaturedSection";
import { AppsOfTheDaySection } from "./components/AppsOfTheDaySection";
import { CategoriesSection } from "./components/CategoriesSection";

export const Home = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <FeaturedSection />
        <AppsOfTheDaySection />
        <CategoriesSection />
      </Box>
    </Container>
  );
};
