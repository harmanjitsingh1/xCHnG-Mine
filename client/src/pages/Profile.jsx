import { clearUser } from "@/store/slices/user.slice";
import { logoutUserThunk } from "@/store/thunks/user.thunk";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  UserCog,
  ChevronRight,
  SquarePen,
  LogOut,
  KeyRound,
  MessageCircleQuestionMark,
  BadgeInfo
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { setFoundUser } from "@/store/slices/admin.slice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import NotificationSetup from "@/components/common/NotificationSetup.jsx"

function Profile() {
  const { userProfile, buttonLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { foundUser } = useSelector((state) => state.admin);

  const handleLogout = async () => {
    const data = await dispatch(logoutUserThunk());
    if (data?.payload?.success) {
      dispatch(clearUser());
      toast.success(data?.payload?.message || "Logout successful!");
      navigate("/");
    } else {
      toast.error(data?.payload?.message || "Logout failed.");
    }
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No profile data found.</p>
      </div>
    );
  }

  const handleEditOpen = () => {
    if (!foundUser || foundUser?._id !== userProfile?._id)
      dispatch(setFoundUser(userProfile));
    navigate(`/admin/users/${userProfile?._id}/edit`);
  };

  return (
    <main className="flex-1 overflow-y-auto md:px-4 py-6 pb-20">
      <section className="mb-4">
        <div
          className={`rounded-xl p-6 shadow-md flex items-center gap-4 ${
            userProfile?.role === "admin"
              ? "bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50"
              : "bg-gray-50 "
          }`}
        >
          <div
            className={`h-16 w-16 aspect-square rounded-full  flex items-center justify-center text-3xl font-bold text-gray-600 ${
              userProfile?.role === "admin" ? "bg-[#ffffffba]" : "bg-gray-100"
            }`}
          >
            {userProfile?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <h2 className="text-xl font-semibold text-gray-900 truncate">
              {userProfile?.username.charAt(0).toUpperCase() + userProfile?.username.slice(1)}
            </h2>
            {userProfile?.email && (
              <p className="text-gray-600 truncate">{userProfile?.email}</p>
            )}
            <p className="text-sm text-gray-500">
              Role: {userProfile?.role === "admin" ? "Admin" : "User"}
            </p>
          </div>
        </div>
      </section>

      {userProfile?.role === "admin" && (
        <Card
          onClick={() => {
            navigate("/admin");
          }}
          className="mb-5"
        >
          <CardContent className="text-lg flex items-center justify-between">
            <CardTitle className="text-md flex gap-3">
              <UserCog size={26} />
              <span>Admin</span>
            </CardTitle>
            <ChevronRight />
          </CardContent>
        </Card>
      )}
      <section className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="mb-3 px-2 text-lg font-semibold text-gray-800">
            Account Information
          </h2>
          {userProfile?.role === "admin" && (
            <button
              onClick={handleEditOpen}
              className="flex items-center gap-2 cursor-pointer font-semibold text-gray-800 border-b border-black pb-0.5"
            >
              <SquarePen size={20} />
              Edit
            </button>
          )}
        </div>
        <div className="rounded-xl bg-white p-4 shadow-md space-y-3">
          <div className="flex justify-between truncate">
            <span className="text-gray-700 mr-4">Full Name</span>
            <span className="font-medium truncate">{userProfile?.username.charAt(0).toUpperCase() + userProfile?.username.slice(1)}</span>
          </div>
          <div className="flex justify-between truncate">
            <span className="text-gray-700 mr-4">Role</span>
            <span className="font-medium truncate">
              {userProfile?.role === "admin" ? "Admin" : "User"}
            </span>
          </div>
          <div className="flex justify-between truncate">
            <span className="text-gray-700 mr-4">Phone</span>
            <span className="font-medium truncate">{userProfile?.phone}</span>
          </div>
          <div className="flex justify-between truncate">
            <span className="text-gray-700 mr-4">Email</span>
            <span className="font-medium truncate">{userProfile?.email}</span>
          </div>
          <div className="flex justify-between truncate">
            <span className="text-gray-700 mr-4">Locality</span>
            <span className="font-medium truncate">{userProfile?.locality}</span>
          </div>
          <div className="flex justify-between truncate">
            <span className="text-gray-700 mr-4">Joined At</span>
            <span className="font-medium truncate">
              {new Date(userProfile?.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </section>
      <section>
        <h2 className="mb-2 px-2 text-lg font-semibold text-gray-800">
          Settings
        </h2>
        <div className="rounded-xl bg-white p-4 shadow-md space-y-3">

<NotificationSetup />

          <button
            onClick={() => navigate("/reset-password")}
            disabled={buttonLoading}
            className="flex items-center gap-2 w-full text-left rounded-lg px-4 py-3 bg-gray-50 hover:bg-gray-100 font-medium text-gray-800"
          >
            <KeyRound size={20} />
            Change Password
          </button>

          <button
            onClick={() => navigate("/faq")}
            disabled={buttonLoading}
            className="flex items-center gap-2 w-full text-left rounded-lg px-4 py-3 bg-gray-50 hover:bg-gray-100 font-medium text-gray-800"
          >
            <BadgeInfo size={20} />
            FAQs
          </button>

          <button
            onClick={() => navigate("/contact")}
            disabled={buttonLoading}
            className="flex items-center gap-2 w-full text-left rounded-lg px-4 py-3 bg-gray-50 hover:bg-gray-100 font-medium text-gray-800"
          >
            <MessageCircleQuestionMark size={20} />
            Contact Us
          </button>
          
          <button
            onClick={() => setShowLogoutModal(true)}
            disabled={buttonLoading}
            className="flex items-center gap-2 w-full text-left rounded-lg px-4 py-3 bg-gray-50 hover:bg-gray-100 font-medium text-red-600"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
        <AlertDialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-md h-10">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="text-md h-10 bg-red-600"
                onClick={handleLogout}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </main>
  );
}

export default Profile;
