// src/GlobalStyle.ts
import { CssBaseline, createTheme } from "@mui/material";
import type { AppTheme } from "./themes";

// Instead of styled-components GlobalStyle, we'll use Material-UI's CssBaseline
// and create theme-aware styles through Material-UI's theme system

export const createMuiTheme = (appTheme: AppTheme) => createTheme({
  palette: {
    mode: appTheme.background === '#333' ? 'dark' : 'light',
    background: {
      default: appTheme.background,
    },
    text: {
      primary: appTheme.color,
    }
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
});

// Export CssBaseline as the default export for consistency
export default CssBaseline;
