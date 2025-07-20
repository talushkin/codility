import "../styles.css";
import React, { useState, useEffect } from "react";
import HeaderBar from "../components/HeaderBar";
import NavMenu from "../components/NavMenu";
import MainContent from "../components/MainContent";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "../components/themes";
import GlobalStyle from "../components/GlobalStyle";
// import { useNavigate } from "react-router-dom"; // unused
import FooterBar from "../components/FooterBar";
import type { Category, Recipe, SiteData } from "../utils/storage";
import type { i18n as I18nType } from "i18next";

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
  const { i18n } = useTranslation() as { i18n: I18nType };
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
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <div className="App">
        <GlobalStyle theme={isDarkMode ? darkTheme : lightTheme} />
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
            <div
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
                language={i18n.language}
                onHamburgerClick={handleHamburgerClick}
              />
            </div>
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
            language={i18n.language}
            i18n={i18n}
          />
        )}
      </div>
    </ThemeProvider>
  );
}