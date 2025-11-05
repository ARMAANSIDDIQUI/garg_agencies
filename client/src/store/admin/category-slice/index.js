import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  categoriesList: [],
  isLoading: false,
  error: null,
  successMessage: null,
};

// Async thunk to fetch all categories
export const getAllCategories = createAsyncThunk(
  "categories/getAllCategories",
  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/admin/category/get"
    );
    return response.data;
  }
);

// Async thunk to add a new category
export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async (categoryData) => {
    const response = await axios.post(
      "http://localhost:5000/api/admin/category/add",
      categoryData
    );
    return response.data;
  }
);

// Async thunk to edit an existing category by ID
export const editCategory = createAsyncThunk(
  "categories/editCategory",
  async ({ id, categoryData }) => {
    const response = await axios.put(
      `http://localhost:5000/api/admin/category/${id}`,
      categoryData
    );
    return response.data;
  }
);

// Async thunk to delete a category by ID
export const deleteCategoryById = createAsyncThunk(
  "categories/deleteCategory",
  async (id) => {
    const response = await axios.delete(
      `http://localhost:5000/api/admin/category/${id}`
    );
    return response.data;
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    resetSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all categories
      .addCase(getAllCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoriesList = action.payload.categories;
      })
      .addCase(getAllCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Add new category
      .addCase(addCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Category added successfully!";
        state.categoriesList.push(action.payload.category);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Edit category by ID
      .addCase(editCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Category updated successfully!";
        const index = state.categoriesList.findIndex(
          (category) => category._id === action.payload.category._id
        );
        if (index !== -1) {
          state.categoriesList[index] = action.payload.category;
        }
      })
      .addCase(editCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Delete category by ID
      .addCase(deleteCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Category deleted successfully!";
        state.categoriesList = state.categoriesList.filter(
          (category) => category._id !== action.payload.category._id
        );
      })
      .addCase(deleteCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { resetSuccessMessage } = categoriesSlice.actions;

export default categoriesSlice.reducer;
