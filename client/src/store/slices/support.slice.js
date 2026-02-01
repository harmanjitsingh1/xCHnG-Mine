import { createSlice } from "@reduxjs/toolkit";
import {
  submitSupportTicket,
  fetchUploadUrlsThunk,
} from "../thunks/support.thunk";
import toast from "react-hot-toast";

const supportSlice = createSlice({
  name: "support",
  initialState: { loading: false, success: false, error: null },
  reducers: {
    resetSupportState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitSupportTicket.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitSupportTicket.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        // toast.success("Ticket submitted successfully!");
      })
      .addCase(submitSupportTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log(action.payload)
        // toast.error(action.payload || action.payload?.message || "Failed to submit ticket");
      })
      
      .addCase(fetchUploadUrlsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUploadUrlsThunk.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(fetchUploadUrlsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // toast.error(action.payload || action.payload?.message || "Failed to submit ticket");
      });
  },
});

export const { resetSupportState } = supportSlice.actions;
export default supportSlice.reducer;
