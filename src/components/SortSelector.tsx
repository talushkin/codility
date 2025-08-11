// External modules
import React from "react";  
import { FormControl, InputLabel, MenuItem, Select as MuiSelect, SelectChangeEvent } from "@mui/material";

// Data
import sorts from "../sorts.json";

interface SortSelectorProps {
  sort: string;
  handleSortChange: (event: React.ChangeEvent<{ value: unknown; }>) => void;
}

export default function SortSelector({ sort, handleSortChange }: SortSelectorProps) {


  const handleChange = (event: SelectChangeEvent<string>) => {
    // Convert SelectChangeEvent to the expected ChangeEvent format
    const syntheticEvent = {
      target: {
        value: event.target.value as unknown
      }
    } as React.ChangeEvent<{ value: unknown; }>;
    
    handleSortChange(syntheticEvent);
  };

  return (
    <div style={{ borderRadius: "6px", marginTop: "15px", marginBottom: "15px", display: "flex", width: "100%", marginRight: "0px", height: "40px"}}>
      <FormControl sx={{ width: "100%", marginRight: "0px" }}>
        <InputLabel id="language-select-label"></InputLabel>
        <MuiSelect
        title="sort products"
          labelId="language-select-label"
          value={sort}
          onChange={handleChange}
          sx={{
            backgroundColor: "darkgreen",
            color: "white",
            width: "100%",
            borderRadius: "4px",
            fontWeight: "bold",
            height: "40px",
            fontSize: "0.75rem",
            textAlign: "center", // Center the selected value
            "& .MuiSelect-select": {
              padding: "4px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center", // Center content horizontally
              textAlign: "center",      // Center text
              fontSize: "0.75rem",
            },
            "& .MuiSvgIcon-root": {
              color: "white",
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "darkgreen",
                color: "white",
                "& .MuiMenuItem-root": {
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  backgroundColor: "darkgreen",
                  "&:hover": {
                    backgroundColor: "#145214",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#145214",
                    color: "white",
                  },
                },
              },
            },
          }}
        >
          {sorts.map((sort: { code: string; label: string }) => (
            <MenuItem
              key={sort.code}
              value={sort.code}
              sx={{
                backgroundColor: "darkgreen",
                color: "white",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#145214",
                },
                "&.Mui-selected": {
                  backgroundColor: "#145214",
                  color: "white",
                },
                textAlign: "center", // Center text in dropdown
                justifyContent: "center",
                display: "flex",
              }}
            >
              {sort.label}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    </div>
  );
}