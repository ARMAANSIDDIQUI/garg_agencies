// src/slices/shopSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    shops: [],
    isLoading: false,
    error: null,
};

// Fetch all shops (users)
export const fetchShops = createAsyncThunk(
    "shop/fetchShops",
    async () => {
        const response = await axios.get("http://localhost:5000/api/admin/users/get", {
            withCredentials: true,
        });
        return response.data; // Assuming the API returns an array of shops (users)
        
    }
);

// Edit a shop's role (change from user to salesman or vice versa)
export const updateRole = createAsyncThunk(
    "shop/updateRole", // Updated to match the action name in Shops.jsx
    async ({ shopId, role }) => {
        const response = await axios.put(`http://localhost:5000/api/admin/users/${shopId}`, { role }, {
            withCredentials: true,
        });
        return response.data; // Return the updated shop/user object
    }
);

// Delete a shop (user)
export const deleteShop = createAsyncThunk(
    "shop/deleteShop",
    async (shopId) => {
        const response = await axios.delete(`http://localhost:5000/api/admin/users/${shopId}`, {
            withCredentials: true,
        });
        return { _id: shopId }; // Return the deleted shop's ID (adjusted)
    }
);

const shopSlice = createSlice({
    name: "shop",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Shops
            .addCase(fetchShops.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchShops.fulfilled, (state, action) => {
                state.isLoading = false;
                state.shops = action.payload;
            })
            .addCase(fetchShops.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            // Edit Shop Role
            .addCase(updateRole.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedShop = action.payload;
                state.shops = state.shops.map(shop =>
                    shop._id === updatedShop._id ? updatedShop : shop
                );
            })
            .addCase(updateRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            // Delete Shop
            .addCase(deleteShop.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteShop.fulfilled, (state, action) => {
                state.isLoading = false;
                const deletedShopId = action.payload._id;
                state.shops = state.shops.filter(shop => shop._id !== deletedShopId);
            })
            .addCase(deleteShop.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    },
});

export default shopSlice.reducer;
