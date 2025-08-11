// External modules
import React from "react";
import { useParams } from "react-router-dom";

// Types
import type { Category, Product, SiteData } from "../utils/types";

// Pages
import HomePage from "./HomePage";

interface ProductDetailProps {
  Products: SiteData;
  setProducts: (Products: SiteData) => void;
  setSelectedCategory: (cat: Category | null) => void;
  setSelectedProduct: (Product: Product | null) => void;
}

export default function ProductDetail(props: ProductDetailProps) {
  const { Products, setProducts, setSelectedCategory, setSelectedProduct } = props;
  const { category, id } = useParams<{ category?: string; id?: string }>();
  const categories = Products.categories || [];
  const selectedCategoryData = categories.find(
    (cat: Category) => cat?.category?.toLowerCase() === category?.toLowerCase()
  ) || null;
  const selectedProductData = selectedCategoryData?.itemPage.find(
    (Product: Product) => Product?._id?.toString().toLowerCase() === id?.toLowerCase()
  ) || null;
  React.useEffect(() => {
    setSelectedCategory(selectedCategoryData);
    setSelectedProduct(selectedProductData);
  }, [category, id, setSelectedCategory, setSelectedProduct, selectedCategoryData, selectedProductData]);
  return (
    <HomePage
      selectedCategory={selectedCategoryData}
      setSelectedCategory={setSelectedCategory}
      selectedProduct={selectedProductData}
      setSelectedProduct={setSelectedProduct}
      newProduct={null}
      Products={Products}
      setProducts={setProducts}
    />
  );
}
