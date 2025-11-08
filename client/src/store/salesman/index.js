// src/slices/salesmanSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    users: [],
    isLoading: true,
    error: null,
    impersonatedUser: null,
    salesmen: [],       // Added state to store salesmen
    salesmenOrders: {}, 
};

export const fetchUsers = createAsyncThunk(
    "salesman/fetchUsers",
    async () => {
        const response = await axios.get("/api/salesman/users", {
            withCredentials: true,
        });
        return response.data;
    }
);

export const addUser = createAsyncThunk(
    "salesman/addUser",
    async (userData) => {
        const response = await axios.post("/api/salesman/users", userData, {
            withCredentials: true,
        });
        return response.data;
    }
);

// export const impersonateUser = createAsyncThunk(
//     "salesman/impersonateUser",
//     async (userId) => {
//         const response = await axios.post(`/api/salesman/impersonate/${userId}`, {}, {
//             withCredentials: true,
//         });
//         return response.data;
//     }
// );

// Fetch salesmen details for admin
export const fetchSalesmen = createAsyncThunk(
    "salesman/fetchSalesmen",
    async () => {
        const response = await axios.get("/api/salesman", {
            withCredentials: true,
        });
        return response.data.salesmen;;
    }
);

// Fetch specific salesman's orders for admin
export const fetchSalesmenOrders = createAsyncThunk(
    "salesman/fetchSalesmenOrders",
    async (salesmanId) => {
        const response = await axios.get(`/api/salesman/orders/${salesmanId}`, {
            withCredentials: true,
        });
        return { salesmanId, orders: response.data.orders };
    }
)

const salesmanSlice = createSlice({
    name: "salesman",
    initialState,
    reducers: {
        clearImpersonatedUser: (state) => {
            state.impersonatedUser = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(addUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users.push(action.payload);
            })
            .addCase(addUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // .addCase(impersonateUser.pending, (state) => {
            //     state.isLoading = true;
            // })
            // .addCase(impersonateUser.fulfilled, (state, action) => {
            //     state.isLoading = false;
            //     state.impersonatedUser = action.payload;
            // })
            // .addCase(impersonateUser.rejected, (state, action) => {
            //     state.isLoading = false;
            //     state.error = action.error.message;
            // })
            .addCase(fetchSalesmen.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSalesmen.fulfilled, (state, action) => {
                state.isLoading = false;
                state.salesmen = action.payload;
                
            })
            
            .addCase(fetchSalesmen.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(fetchSalesmenOrders.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSalesmenOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.salesmenOrders[action.payload.salesmanId] = action.payload.orders;
            })
            .addCase(fetchSalesmenOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
    },
});

export const { clearImpersonatedUser } = salesmanSlice.actions;
export default salesmanSlice.reducer;
