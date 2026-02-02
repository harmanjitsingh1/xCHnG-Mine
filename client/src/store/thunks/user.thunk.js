import { createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "@/lib/axios.js";
import { requestNotificationPermission } from "@/utils/firebase";
import toast from "react-hot-toast";

export const signupUserThunk = createAsyncThunk(
  "auth/signup",
  async (
    { username, email, phone, locality, password },
    { rejectWithValue }
  ) => {
    try {
      const res = await API.post("/auth/signup", {
        username,
        email,
        phone,
        locality,
        password,
      });
      
      const userId = res.data?.user?._id;
      console.log(userId)
      
      if (res.data?.success && userId) {
        await requestNotificationPermission(userId);
      }

      return res.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  }
);

export const loginUserThunk = createAsyncThunk(
  "auth/login",
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const res = await API.post("/auth/login", {
        identifier,
        password,
      });

      const userId = res.data?.user?._id;

      console.log(userId)
      
      if (res.data?.success && userId) {
        await requestNotificationPermission(userId);
      }
      
      return res.data;

    } catch (error) {
      return rejectWithValue({
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  "auth/logout",
  async (rejectWithValue) => {
    try {
      const res = await API.post("/auth/logout");

      
      return res.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  }
);

export const sendResetPassMailThunk = createAsyncThunk(
  "auth/sendResetPassMail",
  async (email, { rejectWithValue }) => {
    try {
      const res = await API.post("/auth/send-reset-password-mail", { email });
      return res.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, otp, password }, { rejectWithValue }) => {
    try {
      const res = await API.post("/auth/reset-password", { email, otp, password });
      return res.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  }
);

export const checkAuthThunk = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/auth/me");

      const userId = res.data?.user?._id;
      console.log(userId)
  
      if (res.data?.success && userId) {
        await requestNotificationPermission(userId);
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Not authenticated" }
      );
    }
  }
);
