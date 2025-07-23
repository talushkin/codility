import React from "react";
import { useParams } from "react-router-dom";
import HomePage from "./HomePage";
import type { Category, Recipe, SiteData } from "../utils/types";

interface RecipeDetailProps {
  recipes: SiteData;
  setRecipes: (recipes: SiteData) => void;
  setSelectedCategory: (cat: Category | null) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
}

export default function RecipeDetail(props: RecipeDetailProps) {
  const { recipes, setRecipes, setSelectedCategory, setSelectedRecipe } = props;
  const { category, id } = useParams<{ category?: string; id?: string }>();
  const categories = recipes.categories || [];
  const selectedCategoryData = categories.find(
    (cat: Category) => cat?.category?.toLowerCase() === category?.toLowerCase()
  ) || null;
  const selectedRecipeData = selectedCategoryData?.itemPage.find(
    (recipe: Recipe) => recipe?._id?.toLowerCase() === id?.toLowerCase()
  ) || null;
  React.useEffect(() => {
    setSelectedCategory(selectedCategoryData);
    setSelectedRecipe(selectedRecipeData);
  }, [category, id, setSelectedCategory, setSelectedRecipe, selectedCategoryData, selectedRecipeData]);
  return (
    <HomePage
      selectedCategory={selectedCategoryData}
      setSelectedCategory={setSelectedCategory}
      selectedRecipe={selectedRecipeData}
      setSelectedRecipe={setSelectedRecipe}
      newRecipe={null}
      recipes={recipes}
      setRecipes={setRecipes}
    />
  );
}
