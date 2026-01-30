import { createSlice } from "@reduxjs/toolkit";
import {
  fetchRequestsThunk,
  fetchRequestByIdThunk,
  approveRequestThunk,
  rejectRequestThunk,
  fetchUserRequestsThunk,
  fetchRequestsCountThunk,
} from "../thunks/request.thunk";

const initialState = {
  requests: [],
  requestDetail: null,
  loading: false,
  buttonLoading: false,
  error: null,
  approveLoading: false,
  rejectLoading: false,
  userRequests: [],
  reqCounts: {
    pending: 0,
    rejected: 0,
    approved: 0,
  },
};

const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    clearRequestDetail: (state) => {
      state.requestDetail = null;
      state.error = null;
    },
    updateRequestRealtime: (state, action) => {
      const req = action.payload;
      if (!req || !req._id) return;

      state.requests = (state.requests || []).map((r) =>
        r._id === req._id ? req : r
      );

      if (!state.requests.some((r) => r._id === req._id)) {
        state.requests.unshift(req);
      }

      if (state.requestDetail && state.requestDetail._id === req._id) {
        state.requestDetail = req;
      }
    },
    updateUserRequests: (state, action) => {
      const req = action.payload;
      if (!req || !req._id) return;

      state.userRequests = (state.userRequests || []).map((r) =>
        r._id === req._id ? req : r
      );

      if (!state.userRequests.some((r) => r._id === req._id)) {
        state.userRequests.unshift(req);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch Requests
      .addCase(fetchRequestsThunk.pending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(fetchRequestsThunk.fulfilled, (state, action) => {
        state.requests = action.payload.requests;
        state.loading = false;
      })
      .addCase(fetchRequestsThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Fetch by ID
      .addCase(fetchRequestByIdThunk.pending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(fetchRequestByIdThunk.fulfilled, (state, action) => {
        state.requestDetail = action.payload;
        state.loading = false;
      })
      .addCase(fetchRequestByIdThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // fetch request counts
      .addCase(fetchRequestsCountThunk.pending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(fetchRequestsCountThunk.fulfilled, (state, action) => {
        state.reqCounts = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchRequestsCountThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      //Fetch user requests
      .addCase(fetchUserRequestsThunk.pending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(fetchUserRequestsThunk.fulfilled, (state, action) => {
        state.userRequests = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserRequestsThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Approve
      .addCase(approveRequestThunk.pending, (state) => {
        state.approveLoading = true;
        state.error = null;
      })
      .addCase(approveRequestThunk.fulfilled, (state, action) => {
        state.approveLoading = false;
      })
      .addCase(approveRequestThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.approveLoading = false;
      })

      // Reject
      .addCase(rejectRequestThunk.pending, (state) => {
        state.rejectLoading = true;
        state.error = null;
      })
      .addCase(rejectRequestThunk.fulfilled, (state, action) => {
        state.rejectLoading = false;
      })
      .addCase(rejectRequestThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.rejectLoading = false;
      });
  },
});

export const { clearRequestDetail, updateRequestRealtime, updateUserRequests } =
  requestSlice.actions;
export default requestSlice.reducer;
