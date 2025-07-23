import React, { useState, useEffect } from "react";
import CaseCard from "./CaseCard";
import Pagination from "@mui/material/Pagination";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
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
  const [openSearch, setOpenSearch] = useState<boolean>(false);
  const [filterItem, setFilterItem] = useState<string>(""); // for filter the products
  const [filteredProducts, setFilteredProducts] = useState<Recipe[]>([]); // for filtered products
  const [selectedSort, setSelectedSort] = useState<string>("_id");
  const [viewedItem, setViewedItem] = useState<Recipe>(selectedRecipe || { _id: "", price: 0, title: "", description: "", preparation: "" });
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    title: "",
    description: "",
    price: 0,
    ingredients: "",
    preparation: "",
    _id: selectedCategory?.itemPage?.length ? (selectedCategory.itemPage.length + 1).toString() : "1",
    categoryId: selectedCategory?._id,
    category: selectedCategory?.category || "",
  });
  // Removed unused: setEditOrder 
  // Remove all usage of editOrder
  const [rowJustify, setRowJustify] = useState<string>(
    window.innerWidth <= 770 ? "center" : "flex-start"
  );
  const [recipes, setRecipes] = useState<Recipe[]>(selectedCategory?.itemPage || []);
  const navigate = useNavigate();

  useEffect(() => {
    if (!openSearch) {
      setFilteredProducts([])
      setFilterItem("");
    } else {
      if (filterItem) {
        //console.log("Filtering products with:", filterItem);
        setFilteredProducts(filterProducts(filterItem));
        setPage(1)
      }
    }
  }, [filterItem, openSearch]);

  useEffect(() => {
    setOpenView(!!selectedRecipe);
    setViewedItem(selectedRecipe || { _id: "", price: 0, title: "", description: "", preparation: "" });
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
        return (parseFloat(a.price as string) || 0) - (parseFloat(b.price as string) || 0);
      }
      return 0;
    });
    setRecipes(sortedRecipes);
  };

  const filterProducts = (filterItem: string) => {
    if (!recipes || recipes.length === 0) return [];
    const filteredProducts = recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(filterItem.toLowerCase())
    );
//    console.log("Filtered products:", filteredProducts);
    return filteredProducts;
  }



  const handleSortChange = (event: React.ChangeEvent<{ value: unknown; }>) => {
//    console.log("Sort changed:", event.target.value);
    SortBy(event.target.value as string);
    setSelectedSort(event.target.value as string);
    setPage(1);
  };

  const handleAddRecipe = async (recipe: Recipe) => {
    let newRecipeData: Recipe = {
      title: recipe?.title,
      description: recipe?.description,
      price: recipe?.price,
      ingredients: recipe?.ingredients,
      preparation: recipe?.preparation,
      categoryId: selectedCategory?._id,
      imageUrl: recipe?.imageUrl || "",
      category: selectedCategory?.category,
      createdAt: new Date().toISOString(),
      _id: recipe?._id || (selectedCategory?.itemPage?.length + 1).toString() || "1",
    };

    try {
      await dispatch(addRecipeThunk({ recipe: newRecipeData, category: selectedCategory }) as any).unwrap();
      setRecipes([...recipes, newRecipeData]);
      setViewedItem(newRecipeData);
      navigate(`/${selectedCategory?.category}/${newRecipeData._id}`);
      window.location.reload();
    } catch (error: any) {
      console.error("Error adding recipe:", error.response?.data || error.message);
    }
    setNewRecipe({ _id: "", title: "", ingredients: "", preparation: "" });
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
          window.location.reload();
        })
        .catch((err: any) => {
          console.error("Error deleting recipe:", err);
        });
    }
  };

  const totalItems = (openSearch && filterItem.length > 0) ? filteredProducts.length : recipes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = (openSearch && filterItem.length > 0) ? filteredProducts.slice(startIndex, endIndex) : recipes.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setViewedItem(recipe);
    setOpenView(true);
    if (recipe && selectedCategory?.category && recipe?.title) {
      const categoryEncoded = encodeURIComponent(selectedCategory?.category);
      const idEncoded = encodeURIComponent(recipe?._id);
      navigate(`/${categoryEncoded}/${idEncoded}`);
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

        <div style={{ display: "flex", gap: "1rem", alignItems: "center", margin: "1rem 0" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenAdd(true)}
            sx={{
              minWidth: "156px",
              minHeight: "40px",
              width: "156px",
              height: "40px",
              borderRadius: "6px",
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
            title="Add a product"
          >
            <AddIcon sx={{ fontSize: 28 }} />
            ADD
          </Button>
          {!openSearch && (<Button
            variant="contained"
            color="primary"
            onClick={() => {
              setOpenSearch(true)
          //    console.log('filter...')
            }}
            sx={{
              minWidth: "256px",
              minHeight: "40px",
              width: "256px",
              height: "40px",
              borderRadius: "6px",
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
            title="filter the list"
          >
            <SearchIcon sx={{ fontSize: 28 }} />
            Filter Products
          </Button>)}
          {openSearch && (
            <Input
              type="text"
              style={{
                minWidth: "256px",
                minHeight: "40px",
                width: "256px",
                height: "40px",
                borderRadius: "6px",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "0.85rem",
                gap: "0.25rem",
                backgroundColor: "white"
              }}
              title="Search Products"
              value={filterItem || ""}
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
            //    console.log("Search term:", searchTerm);
                setFilterItem(searchTerm);
              }}
              onFocus={() => setOpenSearch(true)}
              onBlur={() => {
                setTimeout(() => {
                  setFilterItem("");
                  setOpenSearch(false);
                }, 100);
              }}
            />
          )}
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
            width: "50%"
          }}
        >
          {openSearch && filteredProducts.length === 0 && filterItem.length > 0 && (
            <p style={{ color: "red", textAlign: "center" }}>No products found.</p>
          )}
          {currentItems.map((item, index) => {
            let colClass = "col-6";
            return (
              <div
                key={index}
                className={`${colClass}`}
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
                  selectedRecipe={viewedItem}
                  onDelete={(recipe: Recipe) => {
                    handleDeleteRecipe(recipe);
                  }}
                />
              </div>
            );
          })}
          {currentItems.length > 0 && (<div className="pagination-container" >
            <p style={{
              width: "50%",
              textAlign: "center",
              margin: "10px 0",
              display: "flex",
              justifyContent: "center",
              position: "absolute",
              bottom: "20px"
              /* align-content: flex-end; */
            }}>
              Page {page}, Recipes {startIndex + 1}–{endIndex} of {totalItems}
            </p>
            {totalPages > 1 && (
              <div className="pagination-pages" style={{ direction: "ltr" }}>
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
          </div>)}
        </div>
        <div className="one-product" style={{ width: "40%", display: "flex", marginLeft: "50%", position: "absolute", top: "150px" }}>
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
        </div>

        {/* <RecipeDialog
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
        /> */}
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


    </>
  );
};

export default MainContent;
