// utils/storage.ts
import { Recipe, Category, SiteData } from "./types"; // Adjust the import path as needed
import defaultData from "../data/defaultData.json"; // Adjust the import path as needed

// Image handling utilities
export const uploadImageToLocalStorage = (file: File, recipeId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const dataUrl = event.target?.result as string;
        
        // Store image in localStorage with recipe ID as key
        const imageKey = `recipe_image_${recipeId}`;
        localStorage.setItem(imageKey, dataUrl);
        
        console.log(`Image stored in localStorage with key: ${imageKey}`);
        resolve(dataUrl);
      } catch (error) {
        console.error('Error storing image:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

export const getImageFromLocalStorage = (recipeId: string): string | null => {
  try {
    const imageKey = `recipe_image_${recipeId}`;
    return localStorage.getItem(imageKey);
  } catch (error) {
    console.error('Error retrieving image:', error);
    return null;
  }
};

export const deleteImageFromLocalStorage = (recipeId: string): void => {
  try {
    const imageKey = `recipe_image_${recipeId}`;
    localStorage.removeItem(imageKey);
    console.log(`Image deleted from localStorage: ${imageKey}`);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// Validate image file
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select a valid image file' };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  // Check file format
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Supported formats: JPEG, PNG, GIF, WebP' };
  }
  
  return { isValid: true };
};

// Load categories and recipes from local default data
export const loadData = async (loadFromMemory :boolean = true) => {
  try {
    if (loadFromMemory) {
      const cached = localStorage.getItem("recipeSiteData");
      if (cached) {
        const site = JSON.parse(cached);
    //    console.log("Loaded site from localStorage cache:", site);
        return site;
      }
    }
    
    // Use local default data instead of API calls
    const site = defaultData ? defaultData.site : defaultData;
    
    localStorage.setItem("recipeSiteData", JSON.stringify(site));
//    console.log("Data loaded successfully from defaults:", site);
    return site;
  } catch (err: any) {
    console.error("Error loading data from defaults:", err);
    return { site: { categories: [] } };
  }
}

export const addRecipe = async (recipe: Recipe, category: Category): Promise<any> => {
  console.log("addRecipe locally", recipe, category);
  if (!recipe.title || !category?._id ) {
    console.error("Missing recipe or category ID");
    return null;
  }
  try {
    // Get current data from localStorage
    const cached = localStorage.getItem("recipeSiteData");
    if (!cached) {
      console.error("No data in localStorage");
      return null;
    }
    
    const siteData = JSON.parse(cached);
    const newRecipe = {
      ...recipe,
      createdAt: new Date().toISOString(),
      imageUrl: recipe.imageUrl || `https://placehold.co/100x100?text=${recipe.title || 'No Image'}`,
    };
//    console.log('site data:',siteData)
    // Find the category and add the recipe
    const categoryIndex = siteData.categories.findIndex((cat: any) => cat._id === category._id);
    if (categoryIndex !== -1) {
      siteData.categories[categoryIndex].itemPage.push(newRecipe);
      localStorage.setItem("recipeSiteData", JSON.stringify(siteData));
  //    console.log("Recipe added and updated locally:", newRecipe,siteData);
      return newRecipe;
    } else {
      console.error("Category not found");
      return null;
    }
  } catch (err: any) {
    console.error("Error adding recipe locally:", err.message);
    return null;
  }
};

export const updateRecipe = async (updatedRecipe: Recipe): Promise<any> => {
  if (!updatedRecipe._id) {
//    console.log('updated',updatedRecipe)
    console.error("Missing recipe ID for update.");
    return null;
  }
  try {
    // Get current data from localStorage
    const cached = localStorage.getItem("recipeSiteData");
    if (!cached) {
      console.error("No data in localStorage");
      return null;
    }
    
    const siteData = JSON.parse(cached);
    let recipeFound = false;
    
//    console.log("Updating recipe:", updatedRecipe);
    // Find and update the recipe across all categories
    siteData.site.categories.forEach((category: any) => {
      const recipeIndex = category.itemPage.findIndex((recipe: any) => recipe._id === updatedRecipe._id);
      if (recipeIndex !== -1) {
        category.itemPage[recipeIndex] = {
          ...category.itemPage[recipeIndex],
          ...updatedRecipe,
          imageUrl: updatedRecipe.imageUrl || "https://placehold.co/100x100?text=No+Image",
        };
        recipeFound = true;
      }
    });
    
    if (recipeFound) {
      localStorage.setItem("recipeSiteData", JSON.stringify(siteData));
  //    console.log("Recipe updated locally:", updatedRecipe);
      return updatedRecipe;
    } else {
      console.error("Recipe not found for update");
      return null;
    }
  } catch (err: any) {
    console.error("Error updating recipe locally:", err.message);
    return null;
  }
};

export const delRecipe = async (recipeId: string): Promise<void> => {
  try {
    // Get current data from localStorage
    const cached = localStorage.getItem("recipeSiteData");
    if (!cached) {
      console.error("No data in localStorage");
      return;
    }
    
    const siteData = JSON.parse(cached);
    let recipeDeleted = false;
    
    // Find and delete the recipe from the appropriate category
    siteData.categories.forEach((category: any) => {
      const recipeIndex = category.itemPage.findIndex((recipe: any) => recipe._id === recipeId);
      if (recipeIndex !== -1) {
        category.itemPage.splice(recipeIndex, 1);
        recipeDeleted = true;
      }
    });
    
    if (recipeDeleted) {
      localStorage.setItem("recipeSiteData", JSON.stringify(siteData));
  //    console.log("Recipe deleted locally:", recipeId);
    } else {
      console.error("Recipe not found for deletion");
    }
  } catch (err: any) {
    console.error("Error deleting recipe locally:", err.message);
  }
};

export const addCategory = async (categoryName: string): Promise<any> => {
  if (!categoryName?.trim()) {
    console.warn("Category name is empty");
    return;
  }
  try {
    // Get current data from localStorage
    const cached = localStorage.getItem("recipeSiteData");
    if (!cached) {
      console.error("No data in localStorage");
      return null;
    }
    
    const siteData = JSON.parse(cached);
    
    // Generate a unique ID for the new category
    const newId = Date.now().toString();
    
    // Create new category object
    const newCategory = {
      _id: newId,
      category: categoryName.trim(),
      itemPage: []
    };
    
    // Add the new category to the data
    siteData.site.categories.push(newCategory);
    
    // Save back to localStorage
    localStorage.setItem("recipeSiteData", JSON.stringify(siteData));
    
//    console.log("Category added locally:", newCategory);
    return newCategory;
  } catch (err: any) {
    console.error("Error adding category locally:", err.message);
    return null;
  }
};

export const delCategory = async (categoryId: string, categoryName?: string): Promise<void> => {
  try {
    // Get current data from localStorage
    const cached = localStorage.getItem("recipeSiteData");
    if (!cached) {
      console.error("No data in localStorage");
      return;
    }
    
    const siteData = JSON.parse(cached);
    
    // Find and remove the category
    const categoryIndex = siteData.site.categories.findIndex((cat: any) => cat._id === categoryId);
    
    if (categoryIndex !== -1) {
      siteData.site.categories.splice(categoryIndex, 1);
      localStorage.setItem("recipeSiteData", JSON.stringify(siteData));
  //    console.log("Category deleted locally:", categoryId, categoryName);
    } else {
      console.error("Category not found for deletion:", categoryId);
    }
  } catch (err: any) {
    console.error("Error deleting category locally:", err.message);
  }
};

export const handleItemsChangeOrder = async (orderedCategories: Category[]): Promise<void> => {
  try {
    // Get current data from localStorage
    const cached = localStorage.getItem("recipeSiteData");
    if (!cached) {
      console.error("No data in localStorage");
      return;
    }
    
    const siteData = JSON.parse(cached);
    
    // Update category order by priority
    orderedCategories.forEach((cat, index) => {
      const categoryIndex = siteData.site.categories.findIndex((storeCat: any) => storeCat._id === cat._id);
      if (categoryIndex !== -1) {
        siteData.site.categories[categoryIndex].priority = index + 1;
      }
    });
    
    // Sort categories by priority
    siteData.site.categories.sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0));
    
    localStorage.setItem("recipeSiteData", JSON.stringify(siteData));
//    console.log("Categories reordered successfully");
  } catch (err: any) {
    console.error("Error updating category order locally:", err.message);
  }
};

export const updateCategory = async (updatedCategory: Category): Promise<any> => {
  if (!updatedCategory._id) {
    console.error("Missing category ID for update.");
    return null;
  }
  try {
    // Get current data from localStorage
    const cached = localStorage.getItem("recipeSiteData");
    if (!cached) {
      console.error("No data in localStorage");
      return null;
    }
    
    const siteData = JSON.parse(cached);
    
    // Find and update the category
    const categoryIndex = siteData.site.categories.findIndex((cat: any) => cat._id === updatedCategory._id);
    
    if (categoryIndex !== -1) {
      siteData.site.categories[categoryIndex] = {
        ...siteData.site.categories[categoryIndex],
        ...updatedCategory
      };
      
      localStorage.setItem("recipeSiteData", JSON.stringify(siteData));
  //    console.log("Category updated locally:", updatedCategory);
      return updatedCategory;
    } else {
      console.error("Category not found for update");
      return null;
    }
  } catch (err: any) {
    console.error("Error updating category locally:", err.message);
    return null;
  }
};
