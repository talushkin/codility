import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Autocomplete, TextField } from "@mui/material";
// import RecipeDialog from "./RecipeDialog"; // unused
import cardboardTexture from "../assets/cardboard-texture.jpg";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { Category, Recipe } from "../utils/storage";

interface HeaderBarProps {
  logo?: string;
  onHamburgerClick?: () => void;
  categories: Category[];
  desktop: boolean;
  setSelectedCategory?: (cat: Category | null) => void;
  setSelectedRecipe?: (recipe: Recipe | null) => void;
  selectedRecipe?: Recipe | null;
  setRecipes?: (recipes: Recipe[]) => void;
  newRecipe?: Recipe | null;
  isDarkMode?: boolean;
}

export default function HeaderBar({
  logo,
  onHamburgerClick,
  categories,
  desktop,
  setSelectedCategory,
  setSelectedRecipe,
  selectedRecipe,
  setRecipes,
  newRecipe,
  isDarkMode,
}: HeaderBarProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  // Removed unused: dialogOpen, language
  const [searchActive, setSearchActive] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [translatedOptions, setTranslatedOptions] = useState<{
    title: string;
    category: string;
    originalTitle: string;
  }[]>([]);

  const allRecipes = categories?.flatMap((category) =>
    category.itemPage.map((r) => ({ ...r, category: category.category }))
  );

  useEffect(() => {
    if (!allRecipes) return;
    setTranslatedOptions(
      allRecipes.map((r) => ({
        title: r.title,
        category: r.category,
        originalTitle: r.title,
      }))
    );
  }, [allRecipes, i18n.language, setTranslatedOptions]);

  const handleSearchChange = (_event: any, value: string) => {
    setShowMobileSearch(false);
    setSearchQuery(value);
  };

  const handleSelect = (_event: any, value: string | null) => {
    const option = translatedOptions.find((opt) => opt.title === value);
    if (option) {
      const recipe = allRecipes.find((r) => r.title === option.originalTitle);
      if (recipe) {
        setSearchActive(false);
        setShowMobileSearch(false);
        setSearchQuery("");
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
        navigate(
          `/recipes/${encodeURIComponent(recipe.category)}/${encodeURIComponent(recipe.title)}`
        );
        window.location.reload();
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && searchActive) {
      setSearchActive(false);
      setSearchQuery("");
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  // Removed unused: fadeStyle

  return (
    <>
      <div
        className="HeaderBar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px",
          flexWrap: "nowrap",
          width: "100%",
          boxSizing: "border-box",
          maxHeight: "80px",
        }}
      >
        {/* Left side: Hamburger and Site Name */}
        <div
          style={{
            alignItems: "center",
            gap: "8px",
            transition:
              "opacity 0.4s cubic-bezier(.4,0,.2,1), width 0.4s cubic-bezier(.4,0,.2,1)",
            opacity: searchActive ? 0 : 1,
            width: searchActive ? 0 : "auto",
            pointerEvents: searchActive ? ("none" as React.CSSProperties["pointerEvents"]) : ("auto" as React.CSSProperties["pointerEvents"]),
            willChange: "opacity,width",
            overflow: "hidden" as const,
            minWidth: 0,
            display: searchActive ? "none" : "flex",
          }}
        >
          {!desktop && (
            <button className="hamburger" onClick={onHamburgerClick}>
              ☰
            </button>
          )}
          <img
            src={"https://vt-photos.s3.amazonaws.com/recipe-app-icon-generated-image.png"}
            alt="Logo"
            style={{
              width: "60px",
              borderRadius: "50%",
            }}
          />
          <div className="SiteName">{t("appName")}</div>
        </div>
        {/* Search input or icon */}
        <div style={{ flex: 0, maxWidth: "100%" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                display:
                  !desktop && !showMobileSearch ? "inline-flex" : "none",
                alignItems: "center",
                cursor: "pointer",
                color: "white",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "50%",
                padding: "8px",
                marginLeft: "8px",
              }}
              onClick={() => setShowMobileSearch(true)}
            >
              <SearchIcon sx={{ fontSize: 28 }} />
            </span>
            <Autocomplete
              freeSolo
              options={translatedOptions.map((opt) => opt.title)}
              onInputChange={handleSearchChange}
              onChange={handleSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e, e.target.value)}
                  label={t("search")}
                  placeholder="recipe name"
                  variant="outlined"
                  sx={{
                    minWidth: "50px",
                    maxWidth: "100%",
                    borderRadius: "8px",
                    borderWidth: "0px",
                    backgroundImage: `url(${cardboardTexture})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "repeat",
                    "& .MuiInputBase-input": { color: "white" },
                    "& .MuiInputLabel-root": { color: "white" },
                    "& .MuiOutlinedInput-notchedOutline": { borderWidth: 0 },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white",
                      borderWidth: "2px",
                      borderRadius: "8px",
                    },
                    "&.Mui-focused .MuiInputBase-input": {
                      color: "white",
                    },
                    "&.Mui-focused .MuiInputLabel-root": {
                      color: "white",
                    },
                    display:
                      desktop || showMobileSearch ? "block" : "none",
                    transition: "width 0.3s",
                  }}
                  InputProps={{
                    ...params.InputProps,
                  }}
                  onFocus={() => setSearchActive(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      setSearchActive(false);
                      setShowMobileSearch(false);
                    }, 100);
                  }}
                  onKeyDown={handleKeyDown}
                />
              )}
              sx={{
                width:
                  desktop || showMobileSearch
                    ? { xs: "90vw", sm: "200px" }
                    : "0",
                maxWidth: "95%",
                transition: "width 0.3s ease",
                backgroundImage: `url(${cardboardTexture})`,
                backgroundSize: "fit",
                backgroundRepeat: "repeat",
                borderRadius: "8px",
                position: "relative",
                "& .MuiInputBase-input": {
                  color: "white",
                },
                "& .MuiInputLabel-root": {
                  color: "white",
                },
                "&:focus-within .MuiOutlinedInput-notchedOutline": {
                  borderColor: "white",
                  borderWidth: "2px",
                },
                "&:focus-within .MuiInputBase-input": {
                  color: "white",
                },
                "&:focus-within .MuiInputLabel-root": {
                  color: "white",
                },
                "&:focus-within": {
                  width: "95vw",
                  maxWidth: "95vw",
                  zIndex: 10,
                  position: "relative",
                  left: "unset",
                  right: "unset",
                  margin: "0 auto",
                  borderRadius: "8px",
                  borderWidth: "0px",
                },
                boxSizing: "border-box",
                display: desktop || showMobileSearch ? "block" : "none",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
