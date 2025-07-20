// src/themes.js
import { DefaultTheme } from "styled-components";

export interface AppTheme extends DefaultTheme {
  background: string;
  color: string;
  headerBackground: string;
  sidebarBackground: string;
  caseBackground: string;
  caseTextColor: string;
}

export const lightTheme: AppTheme = {
  background: "#fffce8",
  color: "#333",
  headerBackground: "#333",
  sidebarBackground: "#333",
  caseBackground: "#eeede7",
  caseTextColor: "#333",
};

export const darkTheme: AppTheme = {
  background: "#121212",
  color: "#fff",
  headerBackground: "#444",
  sidebarBackground: "#444",
  caseBackground: "#333",
  caseTextColor: "#fff",
};
