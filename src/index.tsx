import React, { useEffect, useState } from "react";
import i18n from "./i18n";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import RecipeCategory from "./pages/RecipeCategory";
import RecipeDetail from "./pages/RecipeDetail";
import AddRecipe from "./pages/AddRecipe";
import HomePage from "./pages/HomePage";
import "./styles.css";
import { CircularProgress, Box } from "@mui/material";
import { Provider } from "react-redux";
import * as storage from "./utils/storage";
import store from "./store/store";
import type { SiteData, Category, Recipe } from "./utils/storage";
import Questions from "./pages/Questions";

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);


function App() {
  const [recipes, setRecipes] = useState<SiteData | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const params = useParams();

  // Extract params for useEffect dependency
  const categoryParam = params.category;
  const titleParam = params.title;
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      const data = await storage.loadData(false);
      const siteData = (data as any).site ? (data as any).site : data;
      if (!isMounted) return;
      setRecipes(siteData);

      if (siteData?.categories && siteData.categories.length > 0) {
        let initialCategory = siteData.categories[0];
        if (categoryParam) {
          const foundCat = siteData.categories.find(
            (cat: Category) => encodeURIComponent(cat.category) === categoryParam
          );
          if (foundCat) initialCategory = foundCat;
        }
        setSelectedCategory(initialCategory);

        if (titleParam && initialCategory.itemPage) {
          const foundRecipe : Recipe | undefined = initialCategory.itemPage.find(
            (rec: Recipe) => encodeURIComponent(rec.title) === titleParam
          );
          if (foundRecipe) setSelectedRecipe(foundRecipe);
        }
      }
      setLoading(false);
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [categoryParam, titleParam]);

  useEffect(() => {
    document.body.dir =
      i18n.language === "he" || i18n.language === "ar" ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    if (selectedRecipe && selectedRecipe.title && selectedRecipe.category) {
      navigate(
        `/recipes/${encodeURIComponent(selectedRecipe.category)}/${encodeURIComponent(selectedRecipe.title)}`
      );
    }
  }, [selectedRecipe, navigate]);

  return (
    <>
      {loading && (
        <Box
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 2000,
            background: "#fffce8",
          }}
        >
          <CircularProgress size={64} />
        </Box>
      )}
      {!loading && recipes && (
        <Routes>
          <Route
            path="/questions"
            element={
              <Questions
              />
            }
          />
          <Route
            path="/"
            element={
              <HomePage
                recipes={recipes}
                setRecipes={setRecipes}
                selectedRecipe={selectedRecipe}
                setSelectedRecipe={setSelectedRecipe}
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                newRecipe={null}
              />
            }
          />
          <Route
            path="/recipes/:category"
            element={
              <RecipeCategory
                recipes={recipes}
                setRecipes={setRecipes}
                setSelectedRecipe={setSelectedRecipe}
                setSelectedCategory={setSelectedCategory}
              />
            }
          />
          <Route
            path="/recipes/:category/:title"
            element={
              <RecipeDetail
                recipes={recipes}
                setRecipes={setRecipes}
                setSelectedCategory={setSelectedCategory}
                setSelectedRecipe={setSelectedRecipe}
              />
            }
          />
          <Route
            path="/recipes/:category/add"
            element={
              <AddRecipe
                recipes={recipes}
                setRecipes={setRecipes}
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                selectedRecipe={selectedRecipe}
                setSelectedRecipe={setSelectedRecipe}
              />
            }
          />
        </Routes>
      )}
    </>
  );
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Router>
          <App />
        </Router>
      </I18nextProvider>
    </Provider>
  </React.StrictMode>
);