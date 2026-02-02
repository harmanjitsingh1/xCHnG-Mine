import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { admin } from "../config/firebase.js";

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query =
      req.user.role === "user"
        ? { user: req.user._id, roleFor: "user" }
        : { $or: [{ roleFor: "admin" }, { user: req.user._id }] };

    if (req.user?.approvedAt){
      query.createdAt = { $gte: req.user?.approvedAt }
    } else {
      query.createdAt = { $gte: req.user?.createdAt }
    }

    const notifications = await Notification.find(query)
      .populate({
        path: "request",
        populate: [{ path: "file" }],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: skip + notifications.length < total,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateFCMToken = async (req, res) => {
  try {
    const { userId, token } = req.body;
    await User.findByIdAndUpdate(userId, { fcmToken: token });
    res.status(200).json({ message: "Token updated" });
  } catch (error) {
    console.log(error)
  }
};

// 2. Real Notification Logic
export const sendNotification = async (receiverId, title, messageBody) => {
  try {
    const user = await User.findById(receiverId);
    if (!user || !user.fcmToken) return res
      .status(404)
      .json({ success: false, message: "User not found" });

    const message = {
      notification: { title, body: messageBody },
      token: user.fcmToken,
      // Optional: Add data for the PWA to use (like a redirect URL)
      data: { click_action: "/dashboard" }
    };

    await admin.messaging().send(message);
  } catch (error) {
    console.error("Error sending push:", error);
  }
};