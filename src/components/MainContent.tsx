import React, { useState, useEffect, useRef } from "react";
import CaseCard from "./CaseCard";
import Pagination from "@mui/material/Pagination";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import ProductDialog from "./ProductDialog";
import ProductDetails from "./ProductDetails"; // Assuming you have a ProductDetails component
import SortSelector from "./SortSelector"; // Assuming you have a SortSelector component

// import { generateImage } from "./imageAI"; // unused
import { useDispatch } from "react-redux";
import { addProductThunk, delProductThunk, updateProductThunk } from "../store/dataSlice";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import type { Category, Product } from "../utils/types";
import type { AppDispatch } from "../store/store";

// --- Types ---
interface MainContentProps {
  selectedCategory: Category;
  selectedProduct: Product | null;
  addProduct: any;
  desktop: boolean;
  isDarkMode: boolean;
}

// Removed unused SortableProduct component

const MainContent: React.FC<MainContentProps> = ({
  selectedCategory,
  selectedProduct,
  desktop,
  isDarkMode,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState<number>(1);
  const [, setTranslatedCategory] = useState<string>(
    (selectedCategory?.translatedCategory?.[0]?.value) || selectedCategory?.category || ""
  );
  const itemsPerPage: number = 5; // Fixed to 5 to fit on screen without scrolling
  const [openView, setOpenView] = useState<boolean>(false);
  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [openSearch, setOpenSearch] = useState<boolean>(false);
  const [filterItem, setFilterItem] = useState<string>(""); // for filter the products
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // for filtered products
  const [selectedSort, setSelectedSort] = useState<string>("_id");
  const [viewedItem, setViewedItem] = useState<Product>(selectedProduct || { _id: "", price: 0, title: "", description: "" });
  const [newProduct, setNewProduct] = useState<Product>({
    title: "",
    description: "",
    price: 0,
    _id: selectedCategory?.itemPage?.length ? (selectedCategory.itemPage.length + 1).toString() : "1",
    categoryId: selectedCategory?._id,
    category: selectedCategory?.category || "",
  });
  // Removed unused: setEditOrder 
  // Remove all usage of editOrder
  const [rowJustify, setRowJustify] = useState<string>(
    window.innerWidth <= 770 ? "center" : "flex-start"
  );
  const [Products, setProducts] = useState<Product[]>(selectedCategory?.itemPage || []);
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
      // Auto-focus the search input when search opens
      if (searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }
  }, [filterItem, openSearch]);

  useEffect(() => {
    // On mobile, always open the dialog when a product is selected from URL
    // On desktop, keep the current behavior (show in side panel)
    setOpenView(!desktop && !!selectedProduct);
    setViewedItem(selectedProduct || { _id: "", price: 0, title: "", description: "" });
    
    // If a product is selected (e.g., from URL route), navigate to the page containing that product
    // Only do this when search is not active to avoid conflicts with filtered results
    if (selectedProduct && selectedProduct._id && Products.length > 0 && !openSearch) {
      const productIndex = Products.findIndex(product => product._id === selectedProduct._id);
      if (productIndex !== -1) {
        const targetPage = Math.floor(productIndex / itemsPerPage) + 1;
        setPage(targetPage);
      }
    }
  }, [selectedProduct, Products, itemsPerPage, openSearch, desktop]);

  useEffect(() => {
    const itemPage = selectedCategory?.itemPage || [];
    const translated = selectedCategory?.translatedCategory?.[0]?.value || selectedCategory?.category;
    setProducts(itemPage);
    setTranslatedCategory(translated);
  }, [selectedCategory, setProducts, setTranslatedCategory]);

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
    if (!Products || Products.length === 0) return;
    const sortedProducts = [...Products].sort((a, b) => {
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
    setProducts(sortedProducts);
  };

  const filterProducts = (filterItem: string) => {
    if (!Products || Products.length === 0) return [];
    const filteredProducts = Products.filter((Product) =>
      Product.title.toLowerCase().includes(filterItem.toLowerCase())
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

  // Handle real-time image updates from ProductDetails
  const handleImageUpdate = (updatedProduct: Product) => {
    // Update the viewedItem immediately
    setViewedItem(updatedProduct);
    
    // Update the Products list to reflect the change in CaseCard
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  };

  const handleAddProduct = async (Product: Product) => {
    let newProductData: Product = {
      title: Product?.title,
      description: Product?.description,
      price: Product?.price,
      categoryId: selectedCategory?._id,
      imageUrl: Product?.imageUrl || "",
      category: selectedCategory?.category,
      createdAt: new Date().toISOString(),
      _id: Product?._id || (selectedCategory?.itemPage?.length + 1).toString() || "1",
    };

    try {
      await dispatch(addProductThunk({ product: newProductData, category: selectedCategory }) as any).unwrap();
      setProducts([...Products, newProductData]);
      setViewedItem(newProductData);
      navigate(`/${selectedCategory?.category}/${newProductData._id}`);
      window.location.reload();
    } catch (error: any) {
      console.error("Error adding Product:", error.response?.data || error.message);
    }
    setNewProduct({ _id: "", title: "", description: "", price: 0 });
    setOpenAdd(false);
    setOpenView(false);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    updatedProduct._id = viewedItem?._id;
    updatedProduct.categoryId = selectedCategory?._id;
    updatedProduct.category = selectedCategory?.category;
    try {
      await dispatch(updateProductThunk(updatedProduct) as any).unwrap();
      setProducts((prevProducts) =>
        prevProducts.map((r) => (r._id === updatedProduct._id ? updatedProduct : r))
      );
      setOpenView(false);
    } catch (error: any) {
      console.error("Error updating Product:", error.response?.data || error.message);
    }
  };

  const handleDeleteProduct = (Product: Product) => {
    if (!Product._id) return;
    if (window.confirm(`Are you sure you want to delete this Product? ID: ${Product._id} ${Product.title}`)) {
      dispatch(delProductThunk(Product._id) as any)
        .unwrap()
        .then(() => {
          setProducts((prevProducts) =>
            prevProducts.filter((r) => r._id !== Product._id)
          );
          window.location.reload();
        })
        .catch((err: any) => {
          console.error("Error deleting Product:", err);
        });
    }
  };

  const totalItems = (openSearch && filterItem.length > 0) ? filteredProducts.length : Products.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = (openSearch && filterItem.length > 0) ? filteredProducts.slice(startIndex, endIndex) : Products.slice(startIndex, endIndex);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSelectProduct = (Product: Product) => {
    setViewedItem(Product);
    // On mobile, always open the dialog; on desktop, keep it closed (show in side panel)
    setOpenView(!desktop);
    if (Product && selectedCategory?.category && Product?.title) {
      const categoryEncoded = encodeURIComponent(selectedCategory?.category);
      const idEncoded = encodeURIComponent(Product?._id);
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
        <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)]">
          
          {/* Left side - Products list */}
          <div className="w-full lg:w-1/2 flex flex-col h-full">
            {/* Products list header and controls */}
            <div className="flex flex-col gap-1 p-1 border-b">
              <div className="flex flex-row gap-3 items-center w-full">
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
                    inputRef={searchInputRef}
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
              className="main-products flex-1 overflow-hidden"
              style={{ 
                justifyContent: rowJustify,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {openSearch && filteredProducts.length === 0 && filterItem.length > 0 && (
                <p className="text-red-500 text-center">No products found.</p>
              )}
              
              {/* Single column layout - 5 products with fixed heights */}
              <div className="flex flex-col flex-1 gap-2 p-2">
                {currentItems.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="cursor-pointer w-full flex-1"
                    onClick={() => handleSelectProduct(item)}
                  >
                    <CaseCard
                      item={item}
                      isDarkMode={isDarkMode}
                      selectedProduct={viewedItem}
                      onDelete={(Product: Product) => {
                        handleDeleteProduct(Product);
                      }}
                    />
                  </div>
                ))}
                
                {/* Fill remaining slots with empty divs if less than 5 items */}
                {Array.from({ length: 5 - currentItems.slice(0, 5).length }, (_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex-1"
                    style={{ visibility: 'hidden' }}
                  />
                ))}
              </div>
            </div>

            {/* Pagination at bottom of products list */}
            {currentItems.length > 0 && (
              <div className="border-t p-2" style={{ 
                flexShrink: 0
              }}>
                <p className="text-center mb-2 text-sm">
                  Page {page}, Products {startIndex + 1}–{endIndex} of {totalItems}
                </p>
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="small"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          color: isDarkMode ? "white" : "inherit",
                          direction: "ltr",
                          fontSize: "0.75rem",
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

          {/* Right side - Product details - Desktop only */}
          {desktop && (
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
                    product={viewedItem}
                    onClose={handleCloseDialog}
                    onSave={(Product: Product) => {
                      viewedItem?._id ? handleUpdateProduct(Product) : handleAddProduct(Product);
                    }}
                    onDelete={(Product: Product) => {
                      handleDeleteProduct(Product);
                    }}
                    onImageUpdate={handleImageUpdate}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <ProductDialog
          open={openView}
          onClose={handleCloseDialog}
          type="view"
          Product={viewedItem}
          onSave={(Product: Product) => {
            viewedItem?._id ? handleUpdateProduct(Product) : handleAddProduct(Product);
          }}
          onDelete={(Product: Product) => {
            handleDeleteProduct(Product);
          }}

          targetLang="en"
        />
        <ProductDialog
          open={openAdd}
          autoFill={false}
          onClose={handleCloseDialog}
          type="add"
          Product={newProduct}
          categoryName={selectedCategory?.category}
          onSave={(Product: Product) => {
            handleAddProduct(Product);
          }}
          targetLang="en"
        />
      </div >


    </>
  );
};

export default MainContent;
