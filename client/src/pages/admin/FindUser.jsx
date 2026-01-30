import { Search, Loader2, ChevronLeft, SquarePen } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { findUserThunk } from "@/store/thunks/admin.thunk";
import { setFoundUser } from "@/store/slices/admin.slice";

function FindUser() {
  const [identifier, setIdentifier] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { foundUser, buttonLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    if (!identifier) {
      dispatch(setFoundUser(null));
    }
  }, [foundUser]);

  const findUser = async (e) => {
    e.preventDefault();
    dispatch(setFoundUser(null));
    try {
      const response = await dispatch(
        findUserThunk({ identifier: identifier.trim() })
      );

      if (!response.payload?.data?.success) {
        toast.error(
          response.payload?.data?.message ||
            response.payload?.message ||
            "Failed to find User!"
        );
      }
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const handleEditOpen = () => {
    foundUser && navigate(`/admin/users/${foundUser?._id}/edit`);
  };

  const goBack = () => {
    navigate("/admin");
  };

  return (
    <div className="space-y-5 py-4 pb-20">
      <div className="flex items-center gap-2">
        <div
          className="h-10 w-10 flex items-center justify-center cursor-pointer"
          onClick={goBack}
        >
          <ChevronLeft size={26} />
        </div>
        <h2 className="text-xl font-bold">Search for Users</h2>
      </div>

      <form className="flex flex-row gap-3">
        <input
          type="text"
          placeholder="Search User by Username, Phone, or Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          onClick={findUser}
          disabled={buttonLoading || identifier.trim() === ""}
          className="rounded-xl bg-primary px-4 md:px-6 py-3 font-semibold text-white shadow-md transition hover:opacity-90"
        >
          {buttonLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <p className="hidden md:block">Search</p>
              <Search color="#ffffff" className="md:hidden " />
            </>
          )}
        </button>
      </form>

      {foundUser && (
        <section className="px-2 md:px-4">
          <div className="flex items-center justify-between">
            <h2 className="mb-5 text-xl font-semibold text-gray-800">
              User Information
            </h2>
            <button
              onClick={handleEditOpen}
              className="flex items-center gap-2 cursor-pointer font-semibold text-gray-800 border-b border-black pb-0.5"
            >
              <SquarePen size={20} />
              Edit
            </button>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between truncate">
              <span className="text-gray-700 mr-2">Full Name</span>
              <span className="font-medium truncate">{foundUser.username}</span>
            </div>
            <div className="flex justify-between truncate">
              <span className="text-gray-700 mr-2">Email</span>
              <span className="font-medium truncate">{foundUser.email}</span>
            </div>
            <div className="flex justify-between truncate">
              <span className="text-gray-700 mr-2">Phone</span>
              <span className="font-medium truncate">{foundUser.phone}</span>
            </div>
            <div className="flex justify-between truncate">
              <span className="text-gray-700 mr-2">Locality</span>
              <span className="font-medium truncate">{foundUser.locality}</span>
            </div>
            <div className="flex justify-between truncate">
              <span className="text-gray-700 mr-2">Role</span>
              <span className="font-medium truncate">
                {foundUser.role === "admin" ? "Admin" : "User"}
              </span>
            </div>
            <div className="flex justify-between truncate">
              <span className="text-gray-700 mr-2">Account Status</span>
              <span className="font-medium truncate">
                {foundUser.status === "pending"
                  ? "Pending"
                  : foundUser.status === "approved"
                  ? "Active"
                  : foundUser.status === "rejected"
                  ? "Restricted"
                  : ""}
              </span>
            </div>
            <div className="flex justify-between truncate">
              <span className="text-gray-700 mr-2">Joined At</span>
              <span className="font-medium truncate">
                {new Date(foundUser.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default FindUser;
