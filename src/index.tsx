// External modules
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  //useNavigate,
  useParams,
} from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { Provider } from "react-redux";

// Types
import type { SiteData, Category, Product } from "./utils/types";

// Utils/Store
import * as storage from "./utils/storage";
import store from "./store/store";

// Pages
import HomePage from "./pages/HomePage";
import ProductDetail from "./pages/ProductDetail";

// Styles
import "./styles.css";

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);


function App() {
  const [Products, setProducts] = useState<SiteData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const params = useParams();

  // Extract params for useEffect dependency
  const categoryParam = params.category;
  const titleParam = params.title;
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      const data = await storage.loadData(true);
      const siteData = (data as any).site ? (data as any).site : data;
      if (!isMounted) return;
      setProducts(siteData);

      if (siteData?.categories && siteData.categories.length > 0) {
        let initialCategory = siteData.categories[0];
        if (categoryParam) {
          const foundCat = siteData.categories.find(
            (cat: Category) => encodeURIComponent(cat.category) === categoryParam
          );
          if (foundCat) initialCategory = foundCat;
        }
        setSelectedCategory(initialCategory);
        //setSelectedProduct(initialCategory.itemPage[0] || null);
        if (titleParam && initialCategory.itemPage) {
          const foundProduct: Product | undefined = initialCategory.itemPage.find(
            (rec: Product) => encodeURIComponent(rec.title) === titleParam
          );
          if (foundProduct) {
            setSelectedProduct(foundProduct);
          } else {
        //    console.log("first Product:", initialCategory.itemPage[0]);
            setSelectedProduct(initialCategory.itemPage[0] || null);
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
      {!loading && Products && (
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                Products={Products}
                setProducts={setProducts}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                newProduct={null}
              />
            }
          />
                    <Route
            path="/products"
            element={
              <HomePage
                Products={Products}
                setProducts={setProducts}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                newProduct={null}
              />
            }
          />
          <Route
            path="/:category/:id"
            element={
              <ProductDetail
                Products={Products}
                setProducts={setProducts}
                setSelectedCategory={setSelectedCategory}
                setSelectedProduct={setSelectedProduct}
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