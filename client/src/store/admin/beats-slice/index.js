import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  beatsList: [],
  isLoading: false,
  error: null,
  successMessage: null,
};

// Async thunk to fetch all beats
export const getAllBeats = createAsyncThunk("/beats/getAllBeats", async () => {
  const response = await axios.get(`/api/admin/beats/get`);
  return response.data;
});

// Async thunk to add a new beat
export const addNewBeat = createAsyncThunk("/beats/addBeat", async (beatName) => {
  const response = await axios.post(`/api/admin/beats/add`, {
    beatName,
  });
  return response.data;
});

// Async thunk to edit an existing beat by ID
export const editBeatById = createAsyncThunk("/beats/editBeat", async ({ id, beatName }) => {
  const response = await axios.put(`/api/admin/beats/${id}`, {
    beatName,
  });
  return response.data;
});

// Async thunk to delete a beat by ID
export const deleteBeat = createAsyncThunk("/beats/deleteBeat", async (id) => {
  const response = await axios.delete(`/api/admin/beats/${id}`);
  return response.data;
});

const beatsSlice = createSlice({
  name: "beats",
  initialState,
  reducers: {
    resetSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all beats
      .addCase(getAllBeats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllBeats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.beatsList = action.payload.beats;
      })
      .addCase(getAllBeats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Add new beat
      .addCase(addNewBeat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNewBeat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Beat added successfully!";
        state.beatsList.push(action.payload.beat);
      })
      .addCase(addNewBeat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Edit beat by ID
      .addCase(editBeatById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editBeatById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Beat updated successfully!";
        const index = state.beatsList.findIndex((beat) => beat._id === action.payload.beat._id);
        if (index !== -1) {
          state.beatsList[index] = action.payload.beat;
        }
      })
      .addCase(editBeatById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Delete beat by ID
      .addCase(deleteBeat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBeat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Beat deleted successfully!";
        // Remove the deleted beat from the beatsList
        state.beatsList = state.beatsList.filter((beat) => beat._id !== action.payload.beat._id);
      })
      .addCase(deleteBeat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { resetSuccessMessage } = beatsSlice.actions;

export default beatsSlice.reducer;
