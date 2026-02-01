import { Outlet } from "react-router-dom";
import AppInitilizer from "@/context/AppInitilizer"
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import OfflinePage from "./components/common/OfflinePage";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";

export default function RootLayout() {
  const isOnline = useOnlineStatus();

  const prevStatus = useRef(isOnline);

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
          <Outlet />
        </AppInitilizer>
      </div>
    </div>
  );
}
