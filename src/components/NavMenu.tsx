import React, { useState, useEffect } from "react";
import NavItemList from "./NavItemList";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ThemeModeButton from "./ThemeModeButton";
import LanguageSelector from "./LanguageSelector";
import type { Category, Categories } from "../utils/storage";

interface NavMenuProps {
  categories: Categories;
  onSelect: (cat: Category | null) => void;
  isOpen: boolean;
  language: string;
  desktop: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onHamburgerClick: () => void;
}

export default function NavMenu({ categories, onSelect, isOpen, language, desktop, isDarkMode, toggleDarkMode, onHamburgerClick }: NavMenuProps) {
  const { t, i18n } = useTranslation();
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
      navigate(`/recipes/${categoryEncoded}`);
    }
    onHamburgerClick();
    onSelect(item);
    console.log("Selected category:", item);
  };

  // Use correct event type for LanguageSelector (SelectChangeEvent<string>)
  const handleLanguageChange = (event: { target: { value: string } }) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
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
        {t("changeOrder")}
      </Button>
      {/* Only show language and theme buttons on desktop */}
      {desktop && (
        <>
          <div style={{ marginTop: "0rem", marginBottom: "0rem" }}>
            <LanguageSelector language={language} handleLanguageChange={handleLanguageChange} />
          </div>
          <ThemeModeButton isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </>
      )}
    </div>
  );
}
