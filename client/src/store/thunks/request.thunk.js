import { createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "@/lib/axios";

export const fetchRequestByIdThunk = createAsyncThunk(
  "requests/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/requests/detail/${id}`, {
        withCredentials: true,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch request"
      );
    }
  }
);

export const fetchRequestsThunk = createAsyncThunk(
  "requests/fetchRequests",
  async (status, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/requests/${status}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch requests"
      );
    }
  }
);

export const fetchRequestsCountThunk = createAsyncThunk(
  "requests/fetchRequestsCount",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/requests/count`);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch requests count"
      );
    }
  }
);

export const fetchUserRequestsThunk = createAsyncThunk(
  "requests/fetchUserRequests",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/requests/user/requests`, {
        withCredentials: true,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch requests"
      );
    }
  }
);

export const approveRequestThunk = createAsyncThunk(
  "requests/approveRequest",
  async (
    {
      requestId,
      itemPrice,
      serviceCost,
      shippingCost,
      itemRentalCost,
      offerType,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await API.put(
        `/requests/${requestId}/approve`,
        { itemPrice, serviceCost, shippingCost, itemRentalCost, offerType },
        { withCredentials: true }
      );
      return response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to approve request"
      );
    }
  }
);

export const rejectRequestThunk = createAsyncThunk(
  "requests/rejectRequest",
  async (
    {
      requestId,
      message,
      itemPrice,
      serviceCost,
      shippingCost,
      itemRentalCost,
      offerType,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await API.put(
        `/requests/${requestId}/reject`,
        { message, itemPrice, serviceCost, shippingCost, itemRentalCost, offerType },
        { withCredentials: true }
      );
      return response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to reject request"
      );
    }
  }
);
