import React from "react";
import { useParams } from "react-router-dom";
import HomePage from "./HomePage";
import type { Category, Recipe, SiteData } from "../utils/types";

interface RecipeCategoryProps {
  recipes: SiteData;
  setRecipes: (recipes: SiteData) => void;
  setSelectedCategory: (cat: Category | null) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
}

export default function RecipeCategory(props: RecipeCategoryProps) {
  const { recipes, setRecipes, setSelectedCategory, setSelectedRecipe } = props;
  const { category } = useParams<{ category?: string }>();
  const categories = recipes.categories || [];
  const selectedCategoryData : Category | null = categories.find(
    (cat: Category) => cat?.category?.toLowerCase() === category?.toLowerCase()
  ) || null;
  console.log("Selected category data:", selectedCategoryData);
  React.useEffect(() => {
    setSelectedCategory(selectedCategoryData);
  }, [category, setSelectedCategory, selectedCategoryData]);
  return <HomePage
    recipes={recipes}
    setRecipes={setRecipes}
    selectedCategory={selectedCategoryData}
    setSelectedCategory={setSelectedCategory}
    selectedRecipe={null}
    setSelectedRecipe={setSelectedRecipe}
    newRecipe={null}
  />;
}
