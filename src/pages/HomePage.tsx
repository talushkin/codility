import "../styles.css";
import React, { useState, useEffect } from "react";
import HeaderBar from "../components/HeaderBar";
import MainContent from "../components/MainContent";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme, darkTheme } from "../components/themes";
import GlobalStyle, { createMuiTheme } from "../components/GlobalStyle";
// import { useNavigate } from "react-router-dom"; // unused
import FooterBar from "../components/FooterBar";
import type { Category, Recipe, SiteData } from "../utils/types";

interface HomePageProps {
  setSelectedRecipe: (recipe: Recipe | null) => void;
  selectedRecipe: Recipe | null;
  newRecipe?: Recipe | null;
  recipes: SiteData;
  setRecipes: (recipes: SiteData) => void;
  selectedCategory: Category | null;
  setSelectedCategory: (cat: Category | null) => void;
}

export default function Main(props: HomePageProps) {
  const { setSelectedRecipe, selectedRecipe, newRecipe, recipes, selectedCategory, setSelectedCategory } = props;
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [desktop, setDesktop] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth > 768 : true);

  const toggleDarkMode = (): void => {
    setIsDarkMode((prev) => !prev);
  };

  const handleHamburgerClick = (): void => {
    if (desktop) {
      setMenuOpen(true);
      return;
    }
    setMenuOpen((prevMenuOpen) => !prevMenuOpen);
    if (!menuOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleResize = (): void => {
      setDesktop(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setDesktop]);

  const isMobile = !desktop;

  return (
    <ThemeProvider theme={createMuiTheme(isDarkMode ? darkTheme : lightTheme)}>
      <div className="App">
        <GlobalStyle />
        <div className="TOP">
          <HeaderBar
            desktop={desktop}
            logo={recipes.header?.logo}
            onHamburgerClick={handleHamburgerClick}
            categories={recipes.categories}
            isDarkMode={isDarkMode}
            setSelectedCategory={setSelectedCategory}
            setSelectedRecipe={setSelectedRecipe}
            selectedRecipe={selectedRecipe}
            newRecipe={newRecipe}
          />
        </div>
        <div className="container-fluid ps-0 pe-0">
          <div className="flex-column flex-md-row ps-0 pe-0 row">
            {/* <div
              className="nav-menu col-12 col-md-auto ps-0 pe-0"
              style={{ width: desktop ? '270px' : '100%' }}
            >
              <NavMenu
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                categories={recipes.categories}
                isOpen={menuOpen}
                onSelect={setSelectedCategory}
                desktop={desktop}
                onHamburgerClick={handleHamburgerClick}
              />
            </div> */}
            <div className="main-content col">
              {selectedCategory && (
                <MainContent
                  selectedCategory={selectedCategory}
                  selectedRecipe={selectedRecipe}
                  addRecipe={newRecipe}
                  desktop={desktop}
                  isDarkMode={isDarkMode}
                />
              )}
            </div>
          </div>
        </div>
        {/* Sticky FooterBar only on mobile */}
        {isMobile && (
          <FooterBar
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
        )}
      </div>
    </ThemeProvider>
  );
}