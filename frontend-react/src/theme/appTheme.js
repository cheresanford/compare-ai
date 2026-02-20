import { createTheme } from "@mui/material";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1565c0",
    },
    secondary: {
      main: "#42a5f5",
    },
    background: {
      default: "#f4f8ff",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 10,
  },
});
