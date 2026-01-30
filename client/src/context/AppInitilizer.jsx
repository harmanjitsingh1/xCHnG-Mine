import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthThunk, logoutUserThunk } from "@/store/thunks/user.thunk";
import LoadingScreen from "@/components/common/LoadingScreen";
import {
  updateRequestRealtime,
  updateUserRequests,
} from "@/store/slices/request.slice";
import { addNotification } from "@/store/slices/notification.slice";
import { setConnected } from "@/store/slices/socket.slice";
import { initSocket, getSocket, closeSocket } from "@/services/socketService";
import { setUser } from "@/store/slices/user.slice";
import { useNavigate } from "react-router-dom";

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthorized, userProfile } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(checkAuthThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthorized || !userProfile) {
      closeSocket();
      dispatch(setConnected(false));
      return;
    }

    const socket = initSocket();

    const doJoin = () => {
      const payload = { role: userProfile.role, userId: userProfile._id };
      socket.emit("join", payload);
    };

    if (socket.connected) {
      doJoin();
    } else {
      socket.once("connect", doJoin);
    }

    socket.on("connect", () => dispatch(setConnected(true)));
    socket.on("disconnect", () => dispatch(setConnected(false)));

    const handler = (payload) => {
      if (!payload) return;

      if (payload.notification.request) {
        dispatch(updateRequestRealtime(payload?.notification?.request));
        dispatch(updateUserRequests(payload?.notification?.request));
      }

      if (payload.notification?.roleFor === userProfile.role)
        dispatch(addNotification(payload?.notification));

      if (
        String(payload?.userId) === String(userProfile._id) &&
        payload?.notification?.request?.type === "account"
      ) {
        dispatch(setUser(payload?.notification?.request?.user));
      }
    };

    socket.on("notifyAdmins", handler);
    socket.on("notifyUser", handler);

    socket.on("forceLogout", (data) => {
      dispatch(setUser(null));
      dispatch(logoutUserThunk());
      navigate("/");
    });

    return () => {
      socket.off("notifyAdmins", handler);
      socket.off("notifyUser", handler);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("forceLogout");
    };
  }, [isAuthorized, userProfile, dispatch]);

  if (loading) return <LoadingScreen />;
  return children;
}
