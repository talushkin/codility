// External modules
import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";

// Types
import type { Category, Product, SiteData } from "../utils/types";

// Components
import HeaderBar from "../components/HeaderBar";
import MainContent from "../components/MainContent";
import FooterBar from "../components/FooterBar";
import GlobalStyle, { createMuiTheme } from "../components/GlobalStyle";
import { lightTheme, darkTheme } from "../components/themes";

// Styles
import "../styles.css";

interface HomePageProps {
  setSelectedProduct: (Product: Product | null) => void;
  selectedProduct: Product | null;
  newProduct?: Product | null;
  Products: SiteData;
  setProducts: (Products: SiteData) => void;
  selectedCategory: Category | null;
  setSelectedCategory: (cat: Category | null) => void;
}

export default function Main(props: HomePageProps) {
  const { setSelectedProduct, selectedProduct, newProduct, Products, selectedCategory, setSelectedCategory } = props;
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
            logo={Products.header?.logo}
            onHamburgerClick={handleHamburgerClick}
            categories={Products.categories}
            isDarkMode={isDarkMode}
            setSelectedCategory={setSelectedCategory}
            setSelectedProduct={setSelectedProduct}
            selectedProduct={selectedProduct}
            newProduct={newProduct}
          />
        </div>
        <div className="container-fluid ps-0 pe-0">
          <div className="flex-column flex-md-row ps-0 pe-0 row">
            <div className="main-content col">
              {selectedCategory && (
                <MainContent
                  selectedCategory={selectedCategory}
                  selectedProduct={selectedProduct}
                  addProduct={newProduct}
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