import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import { generateToken } from "../utils/generateToken.js";
import Request from "../models/request.model.js";
import { createNotification } from "../utils/createNotification.js";
import { sendAdminEmails } from "../utils/sendAdminEmails.js";
import { sendEmail } from "../services/email.service.js";
import { forceLogoutUser } from "../socket/socket.js";

export const signup = async (req, res) => {
  try {
    const { username, email, phone, locality, password } = req.body;

    if (!username || !phone || !locality || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Username should be between 3 and 50 characters long.",
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format." });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid phone number." });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password should be at least 8 characters long.",
      });
    }

    if (await User.findOne({ username })) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists." });
    }
    if (email && (await User.findOne({ email }))) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists." });
    }
    if (await User.findOne({ phone })) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number already exists." });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      phone,
      locality,
      password: hashPassword,
      status: "pending",
      role: "user",
    });

    const newRequest = await Request.create({
      user: newUser._id,
      type: "account",
      status: "pending",
    });

    await createNotification({
      user: newUser._id,
      roleFor: "admin",
      type: "account",
      message: `${newUser.username} requested account approval`,
      request: newRequest._id,
    });

    if (newUser.email) {
      await sendEmail(
        newUser.email,
        "Welcome to xCHnG - Your account is under review",
        "welcomeUser",
        {
          username: newUser.username,
          date: new Date(newRequest.createdAt).toLocaleString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          }),
        }
      );
    }

    await sendAdminEmails("New User Registered on xCHnG", "newUser", {
      me: newUser._id,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      locality: newUser.locality,
      requestId: newRequest._id,
      date: new Date(newRequest.createdAt).toLocaleString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }),
    });

    const sessionId = uuidv4();

    const token = generateToken(newUser._id, sessionId);

    await Session.create({ userId: newUser._id, token });

    const { password: _, ...safeUser } = newUser.toObject();
    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        partitioned: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Signup successful. Waiting for admin approval.",
        token,
        user: safeUser,
      });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const user = await User.findOne({
      $or: [
        { phone: identifier },
        { username: identifier },
        { email: identifier },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password." });
    }

    if (user.status === "rejected") {
      return res
        .status(401)
        .json({
          success: false,
          message: "Account rejected. Please contact to admin.",
        });
    }

    const sessionId = uuidv4();

    const token = generateToken(user._id, sessionId);

    await Session.create({ userId: user._id, token });

    const { password: _, ...safeUser } = user.toObject();

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        partitioned: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        success: true,
        message: "Login success.",
        token,
        user: safeUser,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error?.message || "Something went wrong. Please try again later.",
    });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    await Session.findOneAndUpdate(
      { token: req.cookies?.token },
      { valid: false }
    );
    res
      .clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        partitioned: true,
        path: "/",
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully.",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error?.message || "Something went wrong. Please try again later.",
    });
  }
};

export const sendResetEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({
      email,
    }).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.resetPasswordExpires > Date.now()) {
      return res.status(200).json({
        success: true,
        message: "OTP has already sent to you email.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = await bcrypt.hash(String(otp), 10);

    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    if (user.email) {
      await sendEmail(
        user.email,
        "Reset Password - xCHnG",
        "resetPasswordCode",
        {
          username: user.username,
          otp,
        }
      );
    }

    res.status(200).json({
      success: true,
      message: "OTP has been sent to your email address.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request!." });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOtp);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid OTP." });
    }

    if (await bcrypt.compare(password, user.password)) {
      return res.status(500).json({
        success: false,
        message: "New password must be different from old one",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();

    forceLogoutUser(user._id, "password_changed");
    
    await Session.updateMany({ userId: user._id }, { valid: false });

    return res.status(200).json({
      success: true,
      message: "Password has been changed.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
