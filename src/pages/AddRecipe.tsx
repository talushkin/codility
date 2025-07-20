import React from "react";
import { useParams } from "react-router-dom";
import HomePage from "./HomePage";
import type { Category, Recipe, SiteData } from "../utils/storage";

interface AddRecipeProps {
  recipes: SiteData;
  setRecipes: (recipes: SiteData) => void;
  selectedCategory: Category | null;
  setSelectedCategory: (cat: Category | null) => void;
  selectedRecipe: Recipe | null;
  setSelectedRecipe: (recipe: Recipe | null) => void;
}

export default function AddRecipe(props: AddRecipeProps) {
  const { recipes, setRecipes, setSelectedCategory, selectedRecipe, setSelectedRecipe } = props;
  const { category } = useParams<{ category?: string }>();
  const categories = recipes.categories || [];
  const selectedCategoryData = categories.find(
    (cat: Category) => cat?.category?.toLowerCase() === category?.toLowerCase()
  ) || null;
  React.useEffect(() => {
    setSelectedCategory(selectedCategoryData);
  }, [category, setSelectedCategory, selectedCategoryData]);
  if (selectedCategoryData) {
    return (
      <HomePage
        selectedCategory={selectedCategoryData}
        newRecipe={{ title: "", ingredients: "", preparation: "" }}
        recipes={recipes}
        setRecipes={setRecipes}
        selectedRecipe={selectedRecipe}
        setSelectedRecipe={setSelectedRecipe}
        setSelectedCategory={setSelectedCategory}
      />
    );
  } else {
    return <div>Category not found.</div>;
  }
}
