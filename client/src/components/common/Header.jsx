import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, MessageCircleQuestionMark } from "lucide-react";
import NavBar from "@/components/common/NavBar";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotificationsThunk } from "@/store/thunks/notification.thunk";

function Header() {
  const dispatch = useDispatch();

  const { notifications } = useSelector((state) => state.notifications);

  useEffect(() => {
    if (notifications.length === 0) {
      dispatch(fetchNotificationsThunk({ page: 1 }));
    }
  }, [dispatch]);

  return (
    <header className="sticky top-0 z-10 bg-primary text-white px-2 md:px-4 py-2 shadow-md flex items-center justify-between">
      <h1 className="text-xl sm:text-2xl px-3 font-bold">xCHnG</h1>

      <div className="hidden md:block">
        <NavBar />
      </div>

      <div className="flex">
        <Link to={"/contact"} className="flex items-center gap-3 p-3 relative">
          <MessageCircleQuestionMark className="cursor-pointer" />
        </Link>

        <Link
          to={"/app/notifications"}
          className="flex items-center gap-3 p-3 relative"
        >
          <Bell className="cursor-pointer" />
          {notifications.length > 0 && (
            <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-red-600"></span>
          )}
        </Link>
      </div>
    </header>
  );
}

export default Header;
