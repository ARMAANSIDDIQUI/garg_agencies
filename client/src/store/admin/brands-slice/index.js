import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  brandsList: [],
  isLoading: false,
  error: null,
  successMessage: null,
};

// Async thunk to fetch all brands
export const getAllBrands = createAsyncThunk("/brands/getAllBrands", async () => {
  const response = await axios.get(`http://localhost:5000/api/admin/brand/get`);
  return response.data;
});

// Async thunk to add a new brand
export const addBrand = createAsyncThunk("/brands/addBrand", async (brandData) => {
  const response = await axios.post(`http://localhost:5000/api/admin/brand/add`, brandData);
  return response.data;
});

// Async thunk to edit an existing brand by ID
export const editBrand = createAsyncThunk("/brands/editBrand", async ({ id, brandData }) => {
  console.log(brandData)
  const response = await axios.put(`http://localhost:5000/api/admin/brand/${id}`, brandData);
  return response.data;
});

// Async thunk to delete a brand by ID
export const deleteBrandById = createAsyncThunk("/brands/deleteBrand", async (id) => {
  const response = await axios.delete(`http://localhost:5000/api/admin/brand/${id}`);
  return response.data;
});

const brandsSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {
    resetSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all brands
      .addCase(getAllBrands.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brandsList = action.payload.brands;
      })
      .addCase(getAllBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Add new brand
      .addCase(addBrand.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Brand added successfully!";
        state.brandsList.push(action.payload.brand);
      })
      .addCase(addBrand.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Edit brand by ID
      .addCase(editBrand.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Brand updated successfully!";
        const index = state.brandsList.findIndex((brand) => brand._id === action.payload.brand._id);
        if (index !== -1) {
          state.brandsList[index] = action.payload.brand;
        }
      })
      .addCase(editBrand.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Delete brand by ID
      .addCase(deleteBrandById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBrandById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Brand deleted successfully!";
        state.brandsList = state.brandsList.filter((brand) => brand._id !== action.payload.brand._id);
      })
      .addCase(deleteBrandById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { resetSuccessMessage } = brandsSlice.actions;

export default brandsSlice.reducer;
