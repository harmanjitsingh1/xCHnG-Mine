import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import Request from "../models/request.model.js";
import { sendEmail } from "../services/email.service.js";
import { createNotification } from "../utils/createNotification.js";
import { forceLogoutUser } from "../socket/socket.js";

export const findUser = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier)
      return res
        .status(400)
        .json({ success: false, message: "Identifier required" });

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier },
        { username: identifier },
      ],
    }).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const findUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const saveUserChanges = async (req, res) => {
  try {
    const { userId, username, email, phone, locality, role, status } = req.body;
    if (!userId || !username || !phone || !locality || !role || !status)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });

    if (email && (await User.findOne({ email, _id: { $ne: userId } }))) {
      return res
        .status(400)
        .json({ success: false, error: "Email already exists." });
    }

    const userBeforeUpdate = await User.findById(userId).select("-password");

    if (!userBeforeUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
        email,
        phone,
        locality,
        role,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (userBeforeUpdate.status !== "approved" && status === "approved") {
      const request = await Request.findOneAndUpdate(
        { user: userId, type: "account", status: "pending" },
        { status: "approved", admin: req?.user?._id }
      );

      await createNotification({
        user: userBeforeUpdate?._id,
        type: "account",
        message: "Your account has been approved.",
        roleFor: "user",
        request: request?._id,
      });

      if (userBeforeUpdate.email) {
        await sendEmail(
          userBeforeUpdate?.email,
          "Your account has been Approved.",
          "accountApproved",
          { username: updatedUser?.username }
        );
      }
    } else if (
      userBeforeUpdate.status !== "rejected" &&
      status === "rejected"
    ) {
      const request = await Request.findOneAndUpdate(
        { user: userId, type: "account", status: "pending" },
        { status: "rejected", admin: req?.user?._id }
      );
      await createNotification({
        user: userBeforeUpdate?._id,
        type: "account",
        message: "Your Account has been suspended.",
        roleFor: "user",
        request: request?._id,
      });

      if (userBeforeUpdate.email) {
        await sendEmail(
          userBeforeUpdate?.email,
          "Your account has been Suspended.",
          "accountRejected",
          { username: updatedUser?.username }
        );
      }
    }

    if (updatedUser.status !== "approved") {
      forceLogoutUser(userBeforeUpdate._id, "account_suspended");
      await Session.updateMany({ userId, valid: true }, { valid: false });
    }

    return res.json({
      success: true,
      message: "User details updated successfully.",
      updatedUser,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
