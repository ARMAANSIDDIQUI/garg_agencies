import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  outOfStockProducts: [],
  currentPage: 1,
  searchQuery:'',
  filteredProducts :[],
};

export const addNewProduct = createAsyncThunk(
  "/products/addnewproduct",
  async (formData) => {
    const result = await axios.post(
      "/api/admin/products/add",
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
  async ({ page = 1, limit = 12, searchQuery ='' }) => {
    const result = await axios.get(
      `/api/admin/products/get?page=${page}&limit=${limit}&searchQuery=${searchQuery}`
    );

    return result?.data;
  }
);
export const fetchAllProductSearch = createAsyncThunk(
  "/products/fetchAllProductSearch",
  async ({ page = 1, limit = 12, searchQuery ='' }) => {
    const result = await axios.get(
      `/api/admin/products/get?page=${page}&limit=${limit}&searchQuery=${searchQuery}`
    );

    return result?.data;
  }
);

export const fetchOutOfStockProducts = createAsyncThunk(
  "/products/fetchOutOfStockProducts",
  async () => {
    const result = await axios.get(
      "/api/admin/products/outOfStock"
    );

    return result?.data;
  }
);

export const editProduct = createAsyncThunk(
  "/products/editProduct",
  async ({ id, formData }) => {
    const result = await axios.put(
      `/api/admin/products/edit/${id}`,
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
      `/api/admin/products/delete/${id}`
    );

    return result?.data;
  }
);

// New async thunk for fetching products for bulk edit
export const fetchProductsForBulkEdit = createAsyncThunk(
  "/products/fetchProductsForBulkEdit",
  async ({ page = 1, limit = 12, searchQuery = '' }) => {
    const result = await axios.get(
      `/api/admin/products/bulk-edit?page=${page}&limit=${limit}&searchQuery=${searchQuery}`,
      {
        withCredentials: true, // Ensure cookies are sent
      }
    );
    return result?.data;
  }
);

// New async thunk for bulk updating products
export const bulkUpdateProducts = createAsyncThunk(
  "/products/bulkUpdateProducts",
  async ({ updates }) => {
    const result = await axios.put(
      "/api/admin/products/bulk-update",
      { updates },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // Ensure cookies are sent
      }
    );
    return result?.data;
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    resetProducts: (state) => {
      state.productList = [];
      state.currentPage = 1;
      state.filteredProducts = [];
    },
     setFilteredProducts: (state, action) => {
      state.filteredProducts = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = [...state.productList, ...action.payload.data];
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
        state.filteredProducts = [...state.productList, ...action.payload.data];
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
        state.outOfStockProducts = action.payload.data;
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
      })
      // New cases for bulk edit products
      .addCase(fetchProductsForBulkEdit.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductsForBulkEdit.fulfilled, (state, action) => {
        state.isLoading = false;
        // Assuming the bulk edit page manages its own product list, not appending to productList
        // state.productList = action.payload.data; 
      })
      .addCase(fetchProductsForBulkEdit.rejected, (state, action) => {
        state.isLoading = false;
        // state.productList = [];
      })
      .addCase(bulkUpdateProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bulkUpdateProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle successful bulk update, e.g., refresh product list or update individual items
      })
      .addCase(bulkUpdateProducts.rejected, (state, action) => {
        state.isLoading = false;
        // Handle error during bulk update
      });
  },
});

export const { resetProducts, setSearchQuery, setFilteredProducts} = AdminProductsSlice.actions;

export default AdminProductsSlice.reducer;
