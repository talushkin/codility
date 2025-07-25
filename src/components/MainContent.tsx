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
  const itemsPerPage: number = 5; // Fixed to 5 to fit on screen without scrolling
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

        {/* Main content container with responsive layout */}
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)]">
          
          {/* Left side - Products list */}
          <div className="w-full lg:w-1/2 flex flex-col">
            {/* Products list header and controls */}
            <div className="flex flex-col gap-4 p-4 border-b">
              <div className="flex flex-row gap-2 items-center w-full">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenAdd(true)}
                  className="flex-1"
                  sx={{
                    minHeight: "40px",
                    height: "40px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 0,
                    fontWeight: "bold",
                    fontSize: "0.75rem",
                    gap: "0.25rem",
                    backgroundColor: "darkgreen",
                    "&:hover": {
                      backgroundColor: "#145214",
                    },
                  }}
                  title="Add a product"
                >
                  <AddIcon sx={{ fontSize: 20 }} />
                  ADD
                </Button>
                
                {!openSearch && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setOpenSearch(true)
                    }}
                    className="flex-1"
                    sx={{
                      minHeight: "40px",
                      height: "40px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 0,
                      fontWeight: "bold",
                      fontSize: "0.75rem",
                      gap: "0.25rem",
                      backgroundColor: "darkgreen",
                      "&:hover": {
                        backgroundColor: "#145214",
                      },
                    }}
                    title="filter the list"
                  >
                    <SearchIcon sx={{ fontSize: 20 }} />
                    Filter Products
                  </Button>
                )}
                
                {openSearch && (
                  <Input
                    type="text"
                    className="flex-1"
                    style={{
                      minHeight: "40px",
                      height: "40px",
                      borderRadius: "6px",
                      padding: "8px",
                      fontWeight: "bold",
                      fontSize: "0.75rem",
                      backgroundColor: "white"
                    }}
                    title="Search Products"
                    value={filterItem || ""}
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
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
                
                <div className="flex-1">
                  <SortSelector
                    sort={selectedSort}
                    handleSortChange={handleSortChange}
                  />
                </div>
              </div>
            </div>

            {/* Products list content */}
            <div 
              className="main-products flex-1 p-4"
              style={{ 
                justifyContent: rowJustify,
                height: 'calc(100vh - 80px)', // Fixed height to prevent scrolling
                overflowY: 'hidden' // Remove Y scrolling
              }}
            >
              {openSearch && filteredProducts.length === 0 && filterItem.length > 0 && (
                <p className="text-red-500 text-center">No products found.</p>
              )}
              
              {/* Single column layout - 5 products with fixed heights */}
              <div className="flex flex-col h-full">
                {currentItems.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="cursor-pointer w-full"
                    onClick={() => handleSelectRecipe(item)}
                    style={{ 
                      height: 'calc(20% - 4px)', // Each item takes exactly 1/5 of available height minus gap
                      marginBottom: '8px' // Gap between cards
                    }}
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
                ))}
                
                {/* Fill remaining slots with empty divs if less than 5 items */}
                {Array.from({ length: 5 - currentItems.slice(0, 5).length }, (_, index) => (
                  <div
                    key={`empty-${index}`}
                    style={{ 
                      height: 'calc(20% - 4px)',
                      visibility: 'hidden' // Hide but maintain space
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Pagination at bottom of products list */}
            {currentItems.length > 0 && (
              <div className="mt-auto border-t">
                <p className="text-center mb-4">
                  Page {page}, Recipes {startIndex + 1}–{endIndex} of {totalItems}
                </p>
                {totalPages > 1 && (
                  <div className="flex justify-center">
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
            )}
          </div>

          {/* Right side - Product details */}
          <div className="w-full lg:w-1/2 flex flex-col height-full" style={{  height: '800px' }}>
            {/* Empty header space to align with left side buttons */}
            <div className="p-4 border-b" style={{ visibility: 'hidden', height: '88px' }}>
              {/* Invisible spacer to match left side header height */}
            </div>
            
            <div className="one-product flex-1 overflow-y-auto p-4">
              <div className="shadow-lg h-full p-4 bg-yellow-50" style={{
                border: isDarkMode ? "1px solid rgb(71, 69, 69)" : "1px solid rgb(234, 227, 227)",
                backgroundColor: isDarkMode ? "rgb(31, 41, 55)" : "#fefce8",
                borderRadius: "5px" // Match CaseCard border radius
              }}>
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
            </div>
          </div>
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
