import { useEffect, useState } from "react";
import {
  Loader2,
  ChevronLeft,
  User,
  UserCog,
  CheckCircle2,
  XCircle,
  Clock2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { setUser } from "@/store/slices/user.slice";
import {
  findUserByIdThunk,
  updateUserDetailsThunk,
} from "@/store/thunks/admin.thunk";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

function EditUserDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmChanges, setShowConfirmChanges] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    phone: "",
    locality: "",
    role: "",
    status: "",
  });

  const { userProfile } = useSelector((state) => state.auth);
  const { foundUser, buttonLoading, loading } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await dispatch(findUserByIdThunk(id));
        if (!response.payload?.data?.success) {
          toast.error(
            response.payload?.data?.message ||
              response.payload?.message ||
              "Failed to find User!"
          );
        }
      } catch (err) {
        toast.error("Something went wrong!");
      }
    };
    if (!foundUser || id !== foundUser?._id) {
      fetchUserDetails();
    }
  }, [foundUser, id, dispatch]);

  useEffect(() => {
    if (foundUser) {
      setUserData({
        username: foundUser?.username,
        email: foundUser?.email,
        phone: foundUser?.phone,
        locality: foundUser?.locality,
        role: foundUser?.role,
        status: foundUser?.status?.toLowerCase(),
      });
    }
  }, [foundUser]);

  useEffect(() => {
    setHasChanges(
      JSON.stringify(userData) !==
        JSON.stringify({
          username: foundUser?.username,
          email: foundUser?.email,
          phone: foundUser?.phone,
          locality: foundUser?.locality,
          role: foundUser?.role,
          status: foundUser?.status,
        })
    );
  }, [userData, foundUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    if (!value) return;
    if (value !== userData.role) {
      setNewRole(value);
      setShowConfirm(true);
    }
  };

  const confirmRoleChange = () => {
    setUserData((prev) => ({ ...prev, role: newRole }));
    setShowConfirm(false);
  };

  const handleStatusChange = (value) => {
    if (!value) return;
    setUserData((prev) => ({ ...prev, status: value }));
  };

  const validateFields = () => {
    const { username, email, phone, locality, role, status } = userData;
    const errors = {};

    if (!username) errors.username = "Username is required";
    else if (username.length < 3)
      errors.username = "Username should be at least 3 characters long";

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email address";
    }
    if (!phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = "Invalid phone number";
    }

    if (!locality) errors.locality = "Locality is required";

    if (!["admin", "user"].includes(role)) {
      errors.role = "Invalid user role";
    }

    if (!["approved", "pending", "rejected"].includes(status)) {
      errors.status = "Invalid account status";
    }

    return errors;
  };

  const saveDetails = async (e) => {
    e.preventDefault();
    setShowConfirmChanges(false);
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      toast.error(
        errors.username ||
          errors.email ||
          errors.phone ||
          errors.locality ||
          errors.role ||
          errors.status
      );
      return;
    }
    try {
      const response = await dispatch(
        updateUserDetailsThunk({ userId: id, ...userData })
      );
      if (response.payload?.data?.success) {
        toast.success(
          response.payload?.data?.message ||
            "User details updated successfully!"
        );
        const updatedUser = response?.payload?.data?.updatedUser;
        if (userProfile?._id === updatedUser?._id) {
          dispatch(setUser(updatedUser));
        }
        goBack();
      } else {
        toast.error(
          response?.payload?.error ||
            response.payload?.data?.message ||
            "Update failed"
        );
      }
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const goBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="space-y-5 py-4 pb-24">
      <div className="flex items-center gap-2">
        <div
          className="h-10 w-10 flex items-center justify-center cursor-pointer"
          onClick={goBack}
        >
          <ChevronLeft size={26} />
        </div>
        <h2 className="text-xl font-bold">Edit User Details</h2>
      </div>

      {!foundUser || loading ? (
        <section className="space-y-5 animate-pulse">
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-1/3 rounded-md" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row mt-8 gap-4 md:gap-6">
            <Skeleton className="flex-1 h-12 rounded-lg" />
            <Skeleton className="flex-1 h-12 rounded-lg" />
          </div>
        </section>
      ) : (
        <section>
          <form
            className="flex w-full flex-col space-y-5"
            autoComplete="on"
            onSubmit={(e) => {
              e.preventDefault();
              setShowConfirmChanges(true);
            }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-800 mb-1">
                  Username
                </Label>
                <Input
                  type="text"
                  name="username"
                  value={userData.username}
                  onChange={handleChange}
                  className="w-full !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
                  required
                />
              </div>
              <div>
                <Label className="text-sm text-gray-800 mb-1 px-2">
                  Email (Optional)
                </Label>
                <Input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="w-full !px-4 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-800 mb-1 px-2">
                  Phone Number
                </Label>
                <Input
                  type="text"
                  name="phone"
                  minLength={10}
                  maxLength={10}
                  value={userData.phone}
                  onChange={handleChange}
                  className="w-full !px-4 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
                  required
                />
              </div>
              <div>
                <Label className="text-sm text-gray-800 mb-1 px-2">
                  Locality
                </Label>
                <Input
                  type="text"
                  name="locality"
                  value={userData.locality}
                  onChange={handleChange}
                  className="w-full !px-4 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
                  required
                />
              </div>

              <div className="flex flex-col">
                <Label className="text-sm text-gray-800 mb-1 px-2">Role</Label>
                <Select onValueChange={handleRoleChange} value={userData.role}>
                  <SelectTrigger className="w-full !px-4 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User /> User
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <UserCog /> Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col">
                <Label className="text-sm text-gray-800 mb-1 px-2">
                  Account Status
                </Label>
                <Select
                  onValueChange={handleStatusChange}
                  value={userData.status}
                >
                  <SelectTrigger className="w-full !px-4 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">
                      <CheckCircle2 className="text-emerald-500" /> Active
                    </SelectItem>
                    <SelectItem value="pending">
                      <Clock2 className="text-yellow-500" /> Pending
                    </SelectItem>
                    <SelectItem value="rejected">
                      <XCircle className="text-red-500" /> Restricted
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex mt-6 gap-4 md:gap-6 flex-col md:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1 py-3 md:py-6 rounded-lg font-semibold shadow-lg text-gray-800"
                disabled={buttonLoading || !hasChanges}
                onClick={() => {
                  setUserData({
                    username: foundUser?.username,
                    email: foundUser?.email,
                    phone: foundUser?.phone,
                    locality: foundUser?.locality,
                    role: foundUser?.role,
                    status: foundUser?.status?.toLowerCase(),
                  });
                }}
              >
                Discard Changes
              </Button>
              <Button
                type="submit"
                disabled={buttonLoading || !hasChanges}
                className="flex-1 py-3 md:py-6 rounded-lg font-semibold shadow-lg text-white disabled:opacity-50 bg-primary hover:opacity-90 disabled:cursor-not-allowed"
              >
                {buttonLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </section>
      )}

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change this user’s role to{" "}
              <strong>{newRole}</strong>?{" "}
              {newRole === "admin" &&
                "Granting admin access gives full control over the system."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showConfirmChanges}
        onOpenChange={setShowConfirmChanges}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure to save the changes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please reivew the changes before confirming.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={saveDetails}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default EditUserDetails;
