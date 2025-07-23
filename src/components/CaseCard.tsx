import React, { useState } from "react";
import type { Recipe } from "../utils/types";
import { Button } from "@mui/material";

interface CaseCardProps {
  item: Recipe;
  category: string;
  index?: number;
  isDarkMode?: boolean;
  onDelete?: (recipe: Recipe) => void;
}


export default function CaseCard({ item, category, index, isDarkMode, onDelete }: CaseCardProps) {
  const [imageUrl, setImageUrl] = useState<string>(item.imageUrl || "https://placehold.co/100x100?text=No+Image");

  const handleDelete = () => {
    if (onDelete) {
      console.log('deleting a product:', item);
      onDelete(item);
    }
  };
  return (
    <div
      className={`case case-index-${index !== undefined ? index : "unknown"}`}
      id={`case-index-${index !== undefined ? index : "unknown"}`}
      style={{
        backgroundColor: isDarkMode ? "#333" : "#fffce8",
        border: isDarkMode
          ? "1px solid rgb(71, 69, 69)"
          : "1px solid rgb(234, 227, 227)",
        borderRadius: "18px",
        transition: "border 0.2s",
      }}
    >
      <img
        src={imageUrl}
        alt={item.title}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          (e.target as HTMLImageElement).src = `https://placehold.co/100x100?text=${encodeURIComponent(item.title)}`;
        }}
      />
      <Button
        onClick={handleDelete}
        variant="contained"
        color="error"
        sx={{
          left: 350,
          top: -50,
          background: "#fff",
          color: "#d32f2f",
          border: "1px solid #d32f2f",
          "&:hover": {
            background: "#f7f1e3",
            color: "#b71c1c",
            border: "1px solid #b71c1c",
          },
        }}
      >
        delete
      </Button>
      <h2>{item.title} / {item.price ? item.price + '$' : ''}</h2>
      <div className="case-description">
        {item.description ? item.description : ""}
      </div>
      <p style={{ color: isDarkMode ? "#fff" : "#333" }}>
        {item._id ? ` # ${item._id}` : ""} / {item.createdAt ? `created : ${new Date(item.createdAt).toLocaleDateString("en-GB")}` : ""}
      </p>
    </div>
  );
}
