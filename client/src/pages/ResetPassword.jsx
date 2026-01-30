import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  sendResetPassMailThunk,
  resetPasswordThunk,
} from "@/store/thunks/user.thunk.js";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { buttonLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSendOtp = async (e) => {
    e.preventDefault();

    let error = "";
    if (!email) error = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      error = "Invalid email address";

    if (error) {
      toast.error(error);
      return;
    }

    const data = await dispatch(sendResetPassMailThunk(email));
    if (data?.payload?.success) {
      toast.success(
        data?.payload?.response?.message ||
          data?.payload?.message ||
          "OTP Sent to your Email."
      );
      setIsOtpSent(true);
      setOtp("");
      setPassword("");
      setConfirmPassword("");
    } else {
      toast.error(
        data?.payload?.response?.message ||
          data?.payload?.message ||
          "Something went wrong!"
      );
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("OTP is required");
      return;
    }
    if (!password || !confirmPassword) {
      toast.error("Password is required");
      return;
    }
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      toast.error("Invalid OTP!");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    const data = await dispatch(resetPasswordThunk({ email, otp, password }));

    if (data?.payload?.success) {
      toast.success(
        data?.payload?.response?.message || data?.payload?.message || "Success"
      );
      navigate("/login");
    } else {
      toast.error(
        data?.payload?.response?.message ||
          data?.payload?.message ||
          "Something went wrong!"
      );
    }
  };

  const goBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6">
      <div
        className="absolute p-3  top-3 left-3 md:top-8 md:left-8 cursor-pointer"
        onClick={goBack}
      >
        <ChevronLeft className="h-7 w-7" />
      </div>
      {isOtpSent ? (
        <div className="w-full max-w-sm flex flex-col items-center space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-bold text-gray-900">
              Reset Your Password
            </h2>
            <p className="text-gray-500">
              We've sent a 6-digit OTP to your email address. Enter the OTP
              below along with your new password.
            </p>
          </div>

          <form
            className="flex w-full flex-col space-y-4"
            autoComplete="on"
            onSubmit={handleResetPassword}
          >
            <div className="flex flex-col">
              <Label className="text-sm text-gray-800 mb-1 px-2">
                One-Time Password (OTP)
              </Label>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                name="otp"
                maxLength={6}
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                }}
                className="w-full !px-4 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
                required
              />
            </div>
            <div className="flex flex-col">
              <Label className="text-sm text-gray-800 mb-1 px-2">
                New Password
              </Label>
              <Input
                type="password"
                placeholder="Enter your New Password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className="w-full !px-4 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
                required
              />
            </div>
            <div className="flex flex-col relative">
              <Label className="text-sm text-gray-800 mb-1 px-2">
                Confirm Password
              </Label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your new password"
                name="confirmPassword"
                autoComplete="confirm-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
                className="w-full !px-4 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
                required
              />

              {confirmPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-[35px] text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
            </div>

            <Button
              type="submit"
              disabled={buttonLoading}
              className="text-lg w-full py-6 rounded-lg font-semibold transition-transform shadow-lg cursor-pointer text-white"
            >
              {buttonLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          <p className="text-sm text-gray-600">
            <button
              onClick={() => setIsOtpSent(false)}
              className="font-medium text-primary underline cursor-pointer"
            >
              Change Email
            </button>
          </p>
        </div>
      ) : (
        <div className="w-full max-w-sm flex flex-col items-center space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-bold text-gray-900">Password Reset</h2>
            <p className="text-gray-500">
              Provide the email address associated with your account to recover
              your password.
            </p>
          </div>

          <form
            className="flex w-full flex-col space-y-4"
            autoComplete="on"
            onSubmit={handleSendOtp}
          >
            <div className="flex flex-col">
              <Label className="text-sm text-gray-800 mb-1 px-2">Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className="w-full !px-4 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={buttonLoading}
              className="text-lg w-full py-6 rounded-lg font-semibold transition-transform shadow-lg cursor-pointer text-white"
            >
              {buttonLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
