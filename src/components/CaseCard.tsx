import React, { useState } from "react";
import type { Recipe } from "../utils/types";

interface CaseCardProps {
  item: Recipe;
  category: string;
  index?: number;
  isDarkMode?: boolean;
}

export default function CaseCard({ item, category, index, isDarkMode }: CaseCardProps) {
  const [imageUrl, setImageUrl] = useState<string>(item.imageUrl || "https://placehold.co/100x100?text=No+Image");

  // Removed unused: isNewRecipe, linkHref

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
      <h2>{item.title}</h2>
      <p style={{ color: isDarkMode ? "#fff" : "#333" }}>
        {item.createdAt ? ` ${new Date(item.createdAt).toLocaleDateString("en-GB")}` : ""}
      </p>
    </div>
  );
}
