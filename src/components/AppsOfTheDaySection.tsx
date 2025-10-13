import { Box, Typography } from "@mui/material";

export const AppsOfTheDaySection = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Aplicaciones del día
      </Typography>
      <Box
        sx={{
          height: 200,
          bgcolor: "grey.200",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Aplicaciones destacadas del día
        </Typography>
      </Box>
    </Box>
  );
};
