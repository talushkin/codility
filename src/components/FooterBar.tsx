import React from "react";
import { Box } from "@mui/material";
import ThemeModeButton from "./ThemeModeButton";
import type { SelectChangeEvent } from "@mui/material";

interface FooterBarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function FooterBar({ isDarkMode, toggleDarkMode}: FooterBarProps) {

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100vw",
        zIndex: 1200,
        background: isDarkMode ? "#333" : "#024803",
        borderTop: isDarkMode
          ? "1px solid rgb(71, 69, 69)"
          : "1px solid rgb(234, 227, 227)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 1,
        boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
        gap: 2,
      }}
    >
      <div style={{ width: "50%", display: "flex", justifyContent: "center" }}>
        <ThemeModeButton isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
      <div style={{ width: "20%" }} />
    </Box>
  );
}