import { createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "@/lib/axios";

export const fetchUploadUrlsThunk = createAsyncThunk(
  "file/fetchUploadUrl",
  async ({ files, email }, { rejectWithValue }) => {
    try {
      const res = await API.post("/support/get-upload-urls", {
        files,
        email
      });
      return res.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  },
);
export const submitSupportTicket = createAsyncThunk(
  "support/submitTicket",
  async ({ username, email, message, screenshots }, { rejectWithValue }) => {
    try {
      const response = await API.post(
        "/support/create-ticket",
        { username, email, message, screenshots },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? error.message);
    }  },
);
