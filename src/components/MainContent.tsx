import React, { useState, useEffect } from "react";
import CaseCard from "./CaseCard";
import Pagination from "@mui/material/Pagination";
import Button from "@mui/material/Button";
import RecipeDialog from "./RecipeDialog";
import ProductDetails from "./ProductDetails"; // Assuming you have a ProductDetails component
import SortSelector from "./SortSelector"; // Assuming you have a SortSelector component

// import { generateImage } from "./imageAI"; // unused
import { useDispatch } from "react-redux";
import { addRecipeThunk, delRecipeThunk, updateRecipeThunk } from "../store/dataSlice";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import type { Category, Recipe } from "../utils/types";
import type { AppDispatch } from "../store/store";

// --- Types ---
interface MainContentProps {
  selectedCategory: Category;
  selectedRecipe: Recipe | null;
  addRecipe: any;
  desktop: boolean;
  isDarkMode: boolean;
}

// Removed unused SortableRecipe component

const MainContent: React.FC<MainContentProps> = ({
  selectedCategory,
  selectedRecipe,
  addRecipe,
  desktop,
  isDarkMode,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const [page, setPage] = useState<number>(1);
  const [translatedCategory, setTranslatedCategory] = useState<string>(
    (selectedCategory?.translatedCategory?.[0]?.value) || selectedCategory?.category || ""
  );
  const itemsPerPage: number = 5;
  const [openView, setOpenView] = useState<boolean>(false);
  const [openAdd, setOpenAdd] = useState<boolean>(false);

  const [selectedSort, setSelectedSort] = useState<string>("_id");
  const [viewedItem, setViewedItem] = useState<Recipe>(selectedRecipe || { title: "", description: "", price: 0, preparation: "" });
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    title: "",
    description: "",
    price: 0,
    ingredients: "",
    preparation: "",
  });
  // Removed unused: setEditOrder
  // Remove all usage of editOrder
  const [rowJustify, setRowJustify] = useState<string>(
    window.innerWidth <= 770 ? "center" : "flex-start"
  );
  const [recipes, setRecipes] = useState<Recipe[]>(selectedCategory?.itemPage || []);
  const navigate = useNavigate();

  useEffect(() => {
    setOpenView(!!selectedRecipe);
    setViewedItem(selectedRecipe || { title: "", ingredients: "", preparation: "" });
  }, [selectedRecipe, setOpenView, setViewedItem]);

  useEffect(() => {
    const itemPage = selectedCategory?.itemPage || [];
    const translated = selectedCategory?.translatedCategory?.[0]?.value || selectedCategory?.category;
    setRecipes(itemPage);
    setTranslatedCategory(translated);
  }, [selectedCategory, setRecipes, setTranslatedCategory]);

  // Translate category name
  useEffect(() => {
    const category = selectedCategory?.category;
    const translatedArr = selectedCategory?.translatedCategory;

    // Use English translation if available, otherwise use original category
    if (Array.isArray(translatedArr) && translatedArr.length > 0) {
      const englishTranslation = translatedArr.find(t => t.lang === "en");
      setTranslatedCategory(englishTranslation?.value || category || "");
    } else {
      setTranslatedCategory(category || "");
    }
  }, [selectedCategory, setTranslatedCategory]);

  // Handle Sort Change

  const SortBy = (sort: string) => {
    if (!recipes || recipes.length === 0) return;
    const sortedRecipes = [...recipes].sort((a, b) => {
      if (sort === "_id") {
        return (a._id || "").localeCompare(b._id || "");
      } else if (sort === "createdAt") {
        return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime();
      } else if (sort === "title") {
        return a.title.localeCompare(b.title);
      } else if (sort === "price") {
        return (a.price || 0) - (b.price || 0);
      }
      return 0;
    });
    setRecipes(sortedRecipes);
  };

  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    console.log("Sort changed:", event.target.value);
    SortBy(event.target.value as string);
    setSelectedSort(event.target.value as string);
  };

  const handleAddRecipe = async (recipe: Recipe) => {
    let newRecipeData: Recipe = {
      title: recipe?.title,
      ingredients: recipe?.ingredients,
      preparation: recipe?.preparation,
      categoryId: selectedCategory?._id,
      imageUrl: recipe?.imageUrl || "",
      category: selectedCategory?.category,
    };

    try {
      await dispatch(addRecipeThunk({ recipe: newRecipeData, category: selectedCategory }) as any).unwrap();
      setRecipes([...recipes, newRecipeData]);
    } catch (error: any) {
      console.error("Error adding recipe:", error.response?.data || error.message);
    }
    setNewRecipe({ title: "", ingredients: "", preparation: "" });
    setOpenAdd(false);
    setOpenView(false);
  };

  const handleUpdateRecipe = async (updatedRecipe: Recipe) => {
    updatedRecipe._id = viewedItem?._id;
    updatedRecipe.categoryId = selectedCategory?._id;
    updatedRecipe.category = selectedCategory?.category;
    try {
      await dispatch(updateRecipeThunk(updatedRecipe) as any).unwrap();
      setRecipes((prevRecipes) =>
        prevRecipes.map((r) => (r._id === updatedRecipe._id ? updatedRecipe : r))
      );
      setOpenView(false);
    } catch (error: any) {
      console.error("Error updating recipe:", error.response?.data || error.message);
    }
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    if (!recipe._id) return;
    if (window.confirm(`Are you sure you want to delete this recipe? ID: ${recipe._id} ${recipe.title}`)) {
      dispatch(delRecipeThunk(recipe._id) as any)
        .unwrap()
        .then(() => {
          setRecipes((prevRecipes) =>
            prevRecipes.filter((r) => r._id !== recipe._id)
          );
        })
        .catch((err: any) => {
          console.error("Error deleting recipe:", err);
        });
    }
  };

  const totalItems = recipes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = recipes.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setViewedItem(recipe);
    setOpenView(true);
    if (recipe && selectedCategory?.category && recipe?.title) {
      const categoryEncoded = encodeURIComponent(selectedCategory?.category);
      const titleEncoded = encodeURIComponent(recipe?.title);
      navigate(`/${categoryEncoded}/${titleEncoded}`);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setRowJustify(
        window.innerWidth <= 770 ? "center" : "flex-start"
      );
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCloseDialog = () => {
    setOpenView(false);
    setOpenAdd(false);
  };
  return (
    <>

      <div className="main">

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenAdd(true)}
            sx={{
              minWidth: "156px",
              minHeight: "56px",
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0,
              fontWeight: "bold",
              fontSize: "0.85rem",
              gap: "0.25rem",
              backgroundColor: "darkgreen",
              "&:hover": {
                backgroundColor: "#145214",
              },
            }}
            title="Add"
          >
            <AddIcon sx={{ fontSize: 28 }} />
            ADD
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenAdd(true)}
            sx={{
              minWidth: "156px",
              minHeight: "56px",
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0,
              fontWeight: "bold",
              fontSize: "0.85rem",
              gap: "0.25rem",
              backgroundColor: "darkgreen",
              "&:hover": {
                backgroundColor: "#145214",
              },
            }}
            title="Add"
          >
            <SearchIcon sx={{ fontSize: 28 }} />
            Search Products
          </Button>
          <SortSelector
            sort={selectedSort}
            handleSortChange={handleSortChange} // Placeholder for sort change handler
          />
        </div>
        <div
          className="main-products"
          style={{
            justifyContent: rowJustify,
            maxHeight: "calc(100vh - 300px)",
            minHeight: "calc(100vh - 300px)",
          }}
        >
          {currentItems.map((item, index) => {
            let colClass = "col-12 col-sm-8 col-md-6 col-lg-3";
            return (
              <div
                key={index}
                className={`${colClass} mb-4 d-flex`}
                style={{
                  justifyContent: rowJustify,
                }}
                onClick={() => handleSelectRecipe(item)}
              >
                <CaseCard
                  index={startIndex + index + 1}
                  item={item}
                  category={selectedCategory?.category}
                  isDarkMode={isDarkMode}
                />
              </div>
            );
          })}
        </div>
        <div>
          <p style={{ flexBasis: "100%", textAlign: "center" }}>
            Page {page}, Recipes {startIndex + 1}–{endIndex} of {totalItems}
          </p>
          {totalPages > 1 && (
            <div className="pagination-container" style={{ direction: "ltr" }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: (theme) => (isDarkMode ? "white" : "inherit"),
                    direction: "ltr",
                  },
                  "& .Mui-selected": {
                    backgroundColor: isDarkMode ? "#fff" : "",
                    color: isDarkMode ? "#222" : "",
                  },
                }}
                dir="ltr"
              />
            </div>
          )}
        </div>
        <RecipeDialog
          open={openView}
          onClose={handleCloseDialog}
          type="view"
          recipe={viewedItem}
          onSave={(recipe: Recipe) => {
            viewedItem?._id ? handleUpdateRecipe(recipe) : handleAddRecipe(recipe);
          }}
          onDelete={(recipe: Recipe) => {
            handleDeleteRecipe(recipe);
          }}

          targetLang="en"
        />
        <RecipeDialog
          open={openAdd}
          autoFill={false}
          onClose={handleCloseDialog}
          type="add"
          recipe={newRecipe}
          categoryName={selectedCategory?.category}
          onSave={(recipe: Recipe) => {
            handleAddRecipe(recipe);
          }}
          targetLang="en"
        />
      </div >
      {/* <div className="one-product col-6">
        <ProductDetails
          open={true}
          recipe={viewedItem}
          onClose={handleCloseDialog}
          onSave={(recipe: Recipe) => {
            viewedItem?._id ? handleUpdateRecipe(recipe) : handleAddRecipe(recipe);
          }}
          onDelete={(recipe: Recipe) => {
            handleDeleteRecipe(recipe);
          }}
        />
      </div> */}

    </>
  );
};

export default MainContent;
