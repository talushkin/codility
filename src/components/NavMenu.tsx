import React, { useState, useEffect } from "react";
import NavItemList from "./NavItemList";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ThemeModeButton from "./ThemeModeButton";
import type { Category, Categories } from "../utils/types";

interface NavMenuProps {
  categories: Categories;
  onSelect: (cat: Category | null) => void;
  isOpen: boolean;
  desktop: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onHamburgerClick: () => void;
}

export default function NavMenu({ categories, onSelect, isOpen, desktop, isDarkMode, toggleDarkMode, onHamburgerClick }: NavMenuProps) {
  const [editCategories, setEditCategories] = useState<boolean>(false);
  const [reorder, setReorder] = useState<boolean>(false);
  const [orderedCategories, setOrderedCategories] = useState<Categories>(categories);

  const navigate = useNavigate();

  useEffect(() => {
    setOrderedCategories(categories);
  }, [categories]);

  const handleOrderChange = (newOrder: Category[]) => {
    setOrderedCategories(newOrder);
  };

  const handleSelectCategory = (item: Category) => {
    setEditCategories(false);
    setReorder(false);

    if (item?.category) {
      const categoryEncoded = encodeURIComponent(item.category);
      navigate(`/${categoryEncoded}`);
    }
    onHamburgerClick();
    onSelect(item);
    console.log("Selected category:", item);
  };


  return (
    <div className={`nav ${isOpen || reorder || desktop ? "show" : "hide"}`}>
      <NavItemList
        editCategories={editCategories}
        categories={orderedCategories}
        onSelect={handleSelectCategory}
        onOrderChange={handleOrderChange}
        setReorder={setReorder}
      />
      <Button
        variant="contained"
        sx={{
          backgroundColor: "darkgreen",
          "&:hover": {
            backgroundColor: "green",
            "& .MuiSvgIcon-root": {
              color: "black",
            },
          },
        }}
        onClick={() => setEditCategories(!editCategories)}
      >
        {editCategories ? "Done" : "Change Order"}
      </Button>
      {/* Only show language and theme buttons on desktop */}
      {desktop && (
        <>
          <ThemeModeButton isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </>
      )}
    </div>
  );
}
