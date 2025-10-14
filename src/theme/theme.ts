import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4A86CF",
    },
    secondary: {
      main: "#F6D32D",
    },
    error: {
      main: "#FF6B6B",
    },
    background: {
      default: "#0D1117",
      paper: "#161B22",
    },
    text: {
      primary: "#C9D1D9",
      secondary: "#8B949E",
    },
    info: {
      main: "#58A6FF",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0D1117",
        },
      },
    },
  },
});
