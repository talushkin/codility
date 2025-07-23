import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
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
import type { SiteData, Category, Recipe } from "./utils/types";

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
        //setSelectedRecipe(initialCategory.itemPage[0] || null);
        if (titleParam && initialCategory.itemPage) {
          const foundRecipe: Recipe | undefined = initialCategory.itemPage.find(
            (rec: Recipe) => encodeURIComponent(rec.title) === titleParam
          );
          if (foundRecipe) {
            setSelectedRecipe(foundRecipe);
          } else {
            console.log("first recipe:", initialCategory.itemPage[0]);
            setSelectedRecipe(initialCategory.itemPage[0] || null);
          }
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
    document.body.dir = "ltr"; // Default to left-to-right
  }, []);

  useEffect(() => {
    // if (selectedRecipe && selectedRecipe.title && selectedRecipe.category) {
    //   navigate(
    //     `/recipes/${encodeURIComponent(selectedRecipe.category)}/${encodeURIComponent(selectedRecipe.title)}`
    //   );
    // }
    console.log("Selected:", selectedRecipe);
  }, [selectedRecipe]);

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
          {/* <Route
            path="/recipes/:category"
            element={
              <RecipeCategory
                recipes={recipes}
                setRecipes={setRecipes}
                setSelectedRecipe={setSelectedRecipe}
                setSelectedCategory={setSelectedCategory}
              />
            }
          /> */}
          <Route
            path="/:category/:title"
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
            path="/:category/add"
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
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>
);