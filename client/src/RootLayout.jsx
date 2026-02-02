import { Outlet } from "react-router-dom";
import AppInitilizer from "@/context/AppInitilizer"
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import OfflinePage from "./components/common/OfflinePage";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";
import { requestNotificationPermission, onForegroundMessage } from "@/utils/firebase";

export default function RootLayout() {
  const isOnline = useOnlineStatus();
  const prevStatus = useRef(isOnline);

  // const handleEnableNotifications = async () => {
  //   // This is now inside a click handler, so the browser will allow it
  //   const token = await requestNotificationPermission();
    
  //   if (token) {
  //     toast.success("Notifications enabled!");
  //     console.log("Token generated:", token);
  //   } else {
  //     toast.error("Permission denied or failed.");
  //   }
  // };

  useEffect(() => {
    // 1. Request Permission & Get Token on mount
    // requestNotificationPermission();

    // 2. Handle Foreground Messages (Toast)
    // Because the Service Worker ONLY handles background messages by default
    const unsubscribe = onForegroundMessage().then((payload) => {
      toast(
        <div>
           <b>{payload.notification.title}</b>
           <p>{payload.notification.body}</p>
        </div>, 
        { icon: '🔔', duration: 4000 }
      );
    });
    
    // Note: onMessage returns an unsubscribe function if handled differently, 
    // but for simple promise usage like above, this is fine.
  }, []);

  useEffect(() => {
    if (isOnline && prevStatus.current === false) {
      toast.success("Back Online.", {
        icon: '🌐',
        duration: 3000,
      });
    }

    if (!isOnline && prevStatus.current === true) {
        toast.error("Connection lost. Working offline.");
    }

    prevStatus.current = isOnline;
  }, [isOnline]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-3xl mx-auto">
        {!isOnline && <OfflinePage />}

        <AppInitilizer>

        {/* <button
        onClick={handleEnableNotifications}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
      >
        Enable Push Notifications
      </button> */}
      
          <Outlet />
        </AppInitilizer>
      </div>
    </div>
  );
}
