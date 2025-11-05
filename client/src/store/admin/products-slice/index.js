import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  outOfStockProducts: [],
  currentPage: 1,  // To keep track of the current page
  searchQuery:'',
  filteredProducts :[],
};

export const addNewProduct = createAsyncThunk(
  "/products/addnewproduct",
  async (formData) => {
    const result = await axios.post(
      "http://localhost:5000/api/admin/products/add",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return result?.data;
  }
);

export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ page = 1, limit = 12, searchQuery ='' }) => { // Accept page and limit as parameters
    const result = await axios.get(
      `http://localhost:5000/api/admin/products/get?page=${page}&limit=${limit}&searchQuery=${searchQuery}`
    );

    return result?.data;
  }
);
export const fetchAllProductSearch = createAsyncThunk(
  "/products/fetchAllProductSearch",
  async ({ page = 1, limit = 12, searchQuery ='' }) => { // Accept page and limit as parameters
    const result = await axios.get(
      `http://localhost:5000/api/admin/products/get?page=${page}&limit=${limit}&searchQuery=${searchQuery}`
    );

    return result?.data;
  }
);

export const fetchOutOfStockProducts = createAsyncThunk(
  "/products/fetchOutOfStockProducts",  // New API for out-of-stock products
  async () => {
    const result = await axios.get(
      "http://localhost:5000/api/admin/products/outOfStock"
    );

    return result?.data;
  }
);

export const editProduct = createAsyncThunk(
  "/products/editProduct",
  async ({ id, formData }) => {
    const result = await axios.put(
      `http://localhost:5000/api/admin/products/edit/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return result?.data;
  }
);

export const deleteProduct = createAsyncThunk(
  "/products/deleteProduct",
  async (id) => {
    const result = await axios.delete(
      `http://localhost:5000/api/admin/products/delete/${id}`
    );

    return result?.data;
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    resetProducts: (state) => {
      state.productList = [];  // Reset the product list
      state.currentPage = 1;   // Reset the current page
      state.filteredProducts = [];
    },
     setFilteredProducts: (state, action) => {
      state.filteredProducts = action.payload;  // Update filtered products
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;  // Update search query
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = [...state.productList, ...action.payload.data]; // Append new products
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = []; 
      })
      .addCase(fetchAllProductSearch.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProductSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredProducts = [...state.productList, ...action.payload.data]; // Append new products
      })
      .addCase(fetchAllProductSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = []; 
      })
      .addCase(fetchOutOfStockProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOutOfStockProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.outOfStockProducts = action.payload.data; // Store out-of-stock products
      })
      .addCase(fetchOutOfStockProducts.rejected, (state) => {
        state.isLoading = false;
        state.outOfStockProducts = []
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        const updatedProducts = state.productList.map(product =>
          product._id === action.payload.data._id ? action.payload.data : product
        );
        state.productList = updatedProducts;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { resetProducts, setSearchQuery, setFilteredProducts} = AdminProductsSlice.actions;

export default AdminProductsSlice.reducer;
