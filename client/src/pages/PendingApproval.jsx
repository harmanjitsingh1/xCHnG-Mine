import { useEffect, useState } from "react";
import { ShieldAlert, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { clearUser, setUser } from "@/store/slices/user.slice";
import { logoutUserThunk } from "../store/thunks/user.thunk";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
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

export default function PendingApproval() {
  const [showDialog, setShowDialog] = useState(false);
  const { userProfile } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userProfile || userProfile.status === "rejected") {
      navigate("/", { replace: true });
      return;
    }
    if (userProfile.status === "approved") {
      navigate("/app/home", { replace: true });
      return;
    }
  }, [userProfile, dispatch, navigate]);

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

  return (
    <div className="flex items-center justify-center min-h-screen px-4 relative">
      <div
        className="absolute top-4 right-4 flex items-center gap-2 cursor-pointer"
        onClick={() => setShowDialog(true)}
      >
        <LogOut />
        Logout
      </div>
      <Card className="w-full max-w-md shadow-md rounded-2xl border bg-white">
        <CardContent className="flex flex-col items-center text-center px-6 py-2">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 mb-6">
            <ShieldAlert size={40} />
          </div>

          <h2 className="text-xl font-semibold text-gray-800">
            Account Under Review
          </h2>

          <p className="text-gray-600 mt-3 text-sm leading-relaxed">
            Your account is currently{" "}
            <span className="font-medium text-indigo-600">
              pending admin approval
            </span>
            . Once approved, you’ll gain full access to the platform.
          </p>

          <div className="w-full mt-6 bg-gray-50 border rounded-lg p-4 text-sm text-gray-500">
            ⏳ You’ll be notified instantly once the review is complete.
          </div>

          <p className="text-gray-600 mt-3 text-sm leading-relaxed">
            Please contact admin at +91 9849284739 for any questions or
            concerns.
          </p>
        </CardContent>
      </Card>

      <footer className="absolute bottom-5">
        <Link
          to="/contact"
          className="text-center text-gray-800 underline cursor-pointer px-4 py-2"
        >
          Contact Us
        </Link>
      </footer>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
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
    </div>
  );
}
