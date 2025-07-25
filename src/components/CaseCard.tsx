import React, { useState, useEffect } from "react";
import type { Product } from "../utils/types";
import { Button } from "@mui/material";
import { getImageFromLocalStorage } from "../utils/storage";

interface CaseCardProps {
  item: Product;
  category: string;
  index?: number;
  isDarkMode?: boolean;
  onDelete?: (product: Product) => void;
  selectedProduct?: Product | null; // Added for potential future use
}




export default function CaseCard({ item, category, index, isDarkMode, onDelete,selectedProduct }: CaseCardProps) {
  const [imageUrl, setImageUrl] = useState<string>(item.imageUrl || "https://placehold.co/100x100?text=No+Image");

  const isSelected :boolean = (item===selectedProduct)

  // Load image from localStorage on component mount and when item changes
  useEffect(() => {
    if (item._id) {
      const localStorageImage = getImageFromLocalStorage(item._id);
      if (localStorageImage) {
        setImageUrl(localStorageImage);
      } else {
        setImageUrl(item.imageUrl || "https://placehold.co/100x100?text=No+Image");
      }
    }
  }, [item._id, item.imageUrl]);
//
  const handleDelete = () => {
    if (onDelete) {
  //    console.log('deleting a product:', item);
      onDelete(item);
    }
  };
  return (
    <div
      className={`relative w-full h-full rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl ${
        isSelected ? "bg-yellow-200" : isDarkMode ? "bg-gray-800" : "bg-yellow-50"
      }`}
      style={{
        border: isDarkMode
          ? "1px solid rgb(71, 69, 69)"
          : "1px solid rgb(234, 227, 227)",
        minHeight: "100px", // Fixed height as requested
        maxHeight: "100px", // Fixed height constraint
        overflow: "hidden", // Hide any overflow content
        borderRadius: "5px" // 5px border radius as requested
      }}
    >
      {/* Delete button - positioned absolutely */}
      <Button
        onClick={handleDelete}
        variant="contained"
        color="error"
        className="top-1 right-1 z-10"
        size="small"
        sx={{
          position: "absolute",
          minWidth: "auto",
          width: "124px",
          height: "24px",
          fontSize: "0.75rem",
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
        Delete
      </Button>

      {/* Main content container */}
      <div className="flex flex-row gap-3 h-full p-3">
        {/* Image container */}
        <div className="flex-shrink-0" style={{ width: "64px", height: "64px" }}>
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "3px", // Slightly smaller radius for image to align with card border
              objectFit: "cover", // Ensures perfect square cropping
              objectPosition: "center" // Centers the image content
            }}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/100x100?text=${encodeURIComponent(item.title)}`;
            }}
          />
        </div>

        {/* Content container */}
        <div className="flex-1 min-w-0 flex flex-row overflow-hidden">
          {/* Left side - Title with Price, Description */}
          <div className="flex-1 flex flex-col" style={{ width: "250px" }}>
            {/* Title and Price on same line */}
            <div className="flex items-baseline">
              <h2 style={{width:"200px"}} className="font-semibold text-gray-800 dark:text-white line-clamp-1 leading-tight flex-1">
                {item.title}
              </h2>
              {/* Price aligned to the right */}
              {item.price && (
                <div className="flex justify-start flex-shrink-0">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    ${parseFloat(item.price.toString()).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            
            {/* Description - closer to title */}
            <div className="text-xs text-gray-600 dark:text-gray-300" style={{ marginTop: '-20px' }}>
              <p className="line-clamp-2 leading-tight">
                {item.description || "No description available"}
              </p>
            </div>
          </div>
          
          {/* Right side - ID and Date */}
          <div className="flex flex-col justify-end items-end text-xs text-gray-500 dark:text-gray-400 ml-3 flex-shrink-0">
            {item._id && (
              <span className="block">#{item._id}</span>
            )}
            {item.createdAt && (
              <span className="block mt-1">
                {new Date(item.createdAt).toLocaleDateString("en-GB")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
