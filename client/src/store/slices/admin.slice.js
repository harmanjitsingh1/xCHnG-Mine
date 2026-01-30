import { createSlice } from "@reduxjs/toolkit";
import { findUserThunk, findUserByIdThunk,updateUserDetailsThunk } from "../thunks/admin.thunk";

const initialState = {
  foundUser: null,
  buttonLoading: false,
  loading: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setFoundUser: (state, action) => {
      state.foundUser = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(findUserThunk.pending, (state) => {
        state.buttonLoading = true;
      })
      .addCase(findUserThunk.fulfilled, (state, action) => {
        state.buttonLoading = false;
        state.foundUser = action?.payload?.data?.user || null;
      })
      .addCase(findUserThunk.rejected, (state) => {
        state.buttonLoading = false;
      })

      .addCase(findUserByIdThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(findUserByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.foundUser = action?.payload?.data?.user || null;
      })
      .addCase(findUserByIdThunk.rejected, (state) => {
        state.loading = false;
      })

      .addCase(updateUserDetailsThunk.pending, (state) => {
        state.buttonLoading = true;
      })
      .addCase(updateUserDetailsThunk.fulfilled, (state, action) => {
        state.buttonLoading = false;
        state.foundUser = action?.payload?.data?.updatedUser || null;
      })
      .addCase(updateUserDetailsThunk.rejected, (state) => {
        state.buttonLoading = false;
      });
  },
});

export const { setFoundUser } =
  adminSlice.actions;
export default adminSlice.reducer;
