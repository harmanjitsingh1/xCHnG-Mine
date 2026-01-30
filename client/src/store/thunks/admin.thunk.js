import { createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "@/lib/axios.js";

// export const addNewAdminThunk = createAsyncThunk(
//   "admin/addNewAdmin",
//   async ({ identifier }, { rejectWithValue }) => {
//     try {
//       const res = await API.post("/admin/add-admin", {
//         identifier,
//       });
//       return res;
//     } catch (err) {
//       return rejectWithValue(err.response?.data || "Failed to add admin");
//     }
//   }
// );

export const findUserThunk = createAsyncThunk(
  "admin/findUser",
  async ({ identifier }, { rejectWithValue }) => {
    try {
      const res = await API.post("admin/find-user", {
        identifier,
      });
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to find user");
    }
  }
);

export const findUserByIdThunk = createAsyncThunk(
  "admin/findUserById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.post(`admin/find-user-by-id/${id}`, {
        withCredentials: true,
      });
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to find user");
    }
  }
);

export const updateUserDetailsThunk = createAsyncThunk(
  "admin/updateUser",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await API.put("admin/save-user-changes", {
        ...userData,
      });
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to find user");
    }
  }
);
