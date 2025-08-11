// Types
import { Product, Category } from "./types";

// Data
import defaultData from "../data/defaultData.json";

// Image handling utilities
export const uploadImageToLocalStorage = (file: File, ProductId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const dataUrl = event.target?.result as string;
        
        // Store image in localStorage with Product ID as key
        const imageKey = `Product_image_${ProductId}`;
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

// Store AI-generated image URL in localStorage
export const storeAIImageToLocalStorage = async (imageUrl: string, ProductId: string): Promise<string> => {
  try {
    // For AI-generated images, we'll store the URL directly
    // This avoids converting large images to base64 and saves storage space
    const imageKey = `Product_image_${ProductId}`;
    localStorage.setItem(imageKey, imageUrl);
    
    console.log(`AI-generated image URL stored in localStorage with key: ${imageKey}`);
    return imageUrl;
  } catch (error) {
    console.error('Error storing AI image URL:', error);
    throw error;
  }
};

export const getImageFromLocalStorage = (ProductId: string): string | null => {
  try {
    const imageKey = `Product_image_${ProductId}`;
    return localStorage.getItem(imageKey);
  } catch (error) {
    console.error('Error retrieving image:', error);
    return null;
  }
};

export const deleteImageFromLocalStorage = (ProductId: string): void => {
  try {
    const imageKey = `Product_image_${ProductId}`;
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

// Load categories and Products from local default data
export const loadData = async (loadFromMemory :boolean = true) => {
  try {
    if (loadFromMemory) {
      const cached = localStorage.getItem("ProductSiteData");
      if (cached) {
        const site = JSON.parse(cached);
        
        // Map localStorage images to Products
        if (site && site.categories) {
          site.categories.forEach((category: any) => {
            if (category.itemPage) {
              category.itemPage.forEach((Product: any) => {
                if (Product._id) {
                  const localStorageImage = getImageFromLocalStorage(Product._id);
                  if (localStorageImage) {
                    Product.imageUrl = localStorageImage;
                  }
                }
              });
            }
          });
        }
        
    //    console.log("Loaded site from localStorage cache with mapped images:", site);
        return site;
      }
    }
    
    // Use local default data instead of API calls
    const site = defaultData ? defaultData.site : defaultData;
    
    localStorage.setItem("ProductSiteData", JSON.stringify(site));
//    console.log("Data loaded successfully from defaults:", site);
    return site;
  } catch (err: any) {
    console.error("Error loading data from defaults:", err);
    return { site: { categories: [] } };
  }
}

export const addProduct = async (product: Product, category: Category): Promise<any> => {
  console.log("addProduct locally", product, category);
  if (!product.title || !category?._id ) {
    console.error("Missing product or category ID");
    return null;
  }
  try {
    // Get current data from localStorage
    const cached = localStorage.getItem("ProductSiteData");
    if (!cached) {
      console.error("No data in localStorage");
      return null;
    }
    
    const siteData = JSON.parse(cached);
    
    // Check if there's a localStorage image for this product
    let finalImageUrl = product.imageUrl;
    if (product._id) {
      const localStorageImage = getImageFromLocalStorage(product._id);
      if (localStorageImage) {
        finalImageUrl = localStorageImage;
      }
    }
    
    const newProduct = {
      ...product,
      createdAt: new Date().toISOString(),
      imageUrl: finalImageUrl || `https://placehold.co/100x100?text=${product.title || 'No Image'}`,
    };
//    console.log('site data:',siteData)
    // Find the category and add the product
    const categoryIndex = siteData.categories.findIndex((cat: any) => cat._id === category._id);
    if (categoryIndex !== -1) {
      siteData.categories[categoryIndex].itemPage.push(newProduct);
      localStorage.setItem("ProductSiteData", JSON.stringify(siteData));
  //    console.log("Product added and updated locally:", newProduct,siteData);
      return newProduct;
    } else {
      console.error("Category not found");
      return null;
    }
  } catch (err: any) {
    console.error("Error adding product locally:", err.message);
    return null;
  }
};

export const updateProduct = async (updatedProduct: Product): Promise<any> => {
  if (!updatedProduct._id) {
//    console.log('updated',updatedProduct)
    console.error("Missing product ID for update.");
    return null;
  }
  try {
    // Get current data from localStorage
    const cached = localStorage.getItem("ProductSiteData");
    if (!cached) {
      console.error("No data in localStorage");
      return null;
    }
    
    const siteData = JSON.parse(cached);
    let productFound = false;
    
    // Check if there's a localStorage image for this product
    let finalImageUrl = updatedProduct.imageUrl;
    if (updatedProduct._id) {
      const localStorageImage = getImageFromLocalStorage(updatedProduct._id);
      if (localStorageImage) {
        finalImageUrl = localStorageImage;
      }
    }
    
//    console.log("Updating product:", updatedProduct);
    // Find and update the product across all categories
    siteData.categories.forEach((category: any) => {
      const productIndex = category.itemPage.findIndex((product: any) => product._id === updatedProduct._id);
      if (productIndex !== -1) {
        category.itemPage[productIndex] = {
          ...category.itemPage[productIndex],
          ...updatedProduct,
          imageUrl: finalImageUrl || "https://placehold.co/100x100?text=No+Image",
        };
        productFound = true;
      }
    });
    
    if (productFound) {
      localStorage.setItem("ProductSiteData", JSON.stringify(siteData));
      console.log("Product updated locally:", updatedProduct);
      return updatedProduct;
    } else {
      console.error("Product not found for update");
      return null;
    }
  } catch (err: any) {
    console.error("Error updating product locally:", err.message);
    return null;
  }
};

export const delProduct = async (productId: string): Promise<void> => {
  try {
    // Get current data from localStorage
    const cached = localStorage.getItem("ProductSiteData");
    if (!cached) {
      console.error("No data in localStorage");
      return;
    }
    
    const siteData = JSON.parse(cached);
    let productDeleted = false;
    
    // Find and delete the product from the appropriate category
    siteData.categories.forEach((category: any) => {
      const productIndex = category.itemPage.findIndex((product: any) => product._id === productId);
      if (productIndex !== -1) {
        category.itemPage.splice(productIndex, 1);
        productDeleted = true;
      }
    });
    
    if (productDeleted) {
      localStorage.setItem("ProductSiteData", JSON.stringify(siteData));
      // Also delete the associated image from localStorage
      deleteImageFromLocalStorage(productId);
  //    console.log("Product and associated image deleted locally:", productId);
    } else {
      console.error("Product not found for deletion");
    }
  } catch (err: any) {
    console.error("Error deleting product locally:", err.message);
  }
};

export const addCategory = async (categoryName: string): Promise<any> => {
  if (!categoryName?.trim()) {
    console.warn("Category name is empty");
    return;
  }
  try {
    // Get current data from localStorage
    const cached = localStorage.getItem("ProductSiteData");
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
    localStorage.setItem("ProductSiteData", JSON.stringify(siteData));
    
//    console.log("Category added locally:", newCategory);
    return newCategory;
  } catch (err: any) {
    console.error("Error adding category locally:", err.message);
    return null;
  }
};

export const delCategory = async (categoryId: string): Promise<void> => {
  try {
    // Get current data from localStorage
    const cached = localStorage.getItem("ProductSiteData");
    if (!cached) {
      console.error("No data in localStorage");
      return;
    }
    
    const siteData = JSON.parse(cached);
    
    // Find and remove the category
    const categoryIndex = siteData.site.categories.findIndex((cat: any) => cat._id === categoryId);
    
    if (categoryIndex !== -1) {
      siteData.site.categories.splice(categoryIndex, 1);
      localStorage.setItem("ProductSiteData", JSON.stringify(siteData));
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
    const cached = localStorage.getItem("ProductSiteData");
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
    
    localStorage.setItem("ProductSiteData", JSON.stringify(siteData));
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
    const cached = localStorage.getItem("ProductSiteData");
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
      
      localStorage.setItem("ProductSiteData", JSON.stringify(siteData));
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
