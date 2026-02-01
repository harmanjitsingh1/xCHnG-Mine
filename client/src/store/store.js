import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slices/user.slice.js";
import requestSlice from "./slices/request.slice.js";
import notificationSlice from "./slices/notification.slice.js";
import socketSlice from "./slices/socket.slice.js";
import filesSlice from "./slices/file.slice.js";
import adminSlice from "./slices/admin.slice.js";
import supportSlice from "./slices/support.slice.js";

export const store = configureStore({
  reducer: {
    auth: userSlice,
    admin: adminSlice,
    requests: requestSlice,
    notifications: notificationSlice,
    files: filesSlice,
    socket: socketSlice,
    support: supportSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
