import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as storage from '../utils/storage';

// Define types for state and payloads as needed
interface SiteData {
  // Define the structure of your site data here
  [key: string]: any;
}

interface DataState {
  site: SiteData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DataState = {
  site: null,
  loading: false,
  error: null,
};

// Async thunk for loading data
export const loadDataThunk = createAsyncThunk<SiteData, void, { rejectValue: string }>(
  'data/loadData',
  async (_, { rejectWithValue }) => {
    try {
      const site = await storage.loadData();
      return site;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for adding a category
export const addCategoryThunk = createAsyncThunk<any, string, { rejectValue: string }>(
  'data/addCategory',
  async (categoryName, { rejectWithValue }) => {
    try {
      const res = await storage.addCategory(categoryName);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for deleting a category
export const delCategoryThunk = createAsyncThunk<any, { categoryId: string; categoryName: string }, { rejectValue: string }>(
  'data/delCategory',
  async ({ categoryId, categoryName }, { rejectWithValue }) => {
    try {
      await storage.delCategory(categoryId, categoryName);
      return categoryId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for reordering categories
export const reorderCategoriesThunk = createAsyncThunk<any, any[], { rejectValue: string }>(
  'data/reorderCategories',
  async (orderedCategories, { rejectWithValue }) => {
    try {
      await storage.handleItemsChangeOrder(orderedCategories);
      return orderedCategories;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for adding a product
export const addProductThunk = createAsyncThunk<any, { product: any; category: any }, { rejectValue: string }>(
  'data/addProduct',
  async ({ product, category }, { rejectWithValue }) => {
    try {
      const res = await storage.addProduct(product, category);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for deleting a product
export const delProductThunk = createAsyncThunk<
  string, // Return type: the deleted product's ID
  string, // Argument type: the product's ID
  { rejectValue: string }
>(
  'data/delProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await storage.delProduct(productId);
      return productId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for updating a product
export const updateProductThunk = createAsyncThunk<
  any, // Return type: updated product object
  any, // Argument type: updated product object
  { rejectValue: string }
>(
  'data/updateProduct',
  async (updatedProduct, { rejectWithValue }) => {
    try {
      const res = await storage.updateProduct(updatedProduct);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Add your synchronous reducers here
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDataThunk.fulfilled, (state, action: PayloadAction<SiteData>) => {
        state.site = action.payload;
        state.loading = false;
      })
      .addCase(loadDataThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(delProductThunk.fulfilled, (state, action) => {
        // Remove the product from all categories in state.site.pages
        if (state.site && state.site.pages) {
          state.site.pages = state.site.pages.map((cat: any) => ({
            ...cat,
            itemPage: Array.isArray(cat.itemPage)
              ? cat.itemPage.filter((r: any) => r._id !== action.payload)
              : [],
          }));
        }
      })
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        // Update the product in all categories in state.site.pages
        if (state.site && state.site.pages) {
          state.site.pages = state.site.pages.map((cat: any) => ({
            ...cat,
            itemPage: Array.isArray(cat.itemPage)
              ? cat.itemPage.map((r: any) =>
                  r._id === action.payload._id ? { ...r, ...action.payload } : r
                )
              : [],
          }));
        }
      });
    // Add cases for other thunks as needed
  },
});

export default dataSlice.reducer;
