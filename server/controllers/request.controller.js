import Request from "../models/request.model.js";
import User from "../models/user.model.js";
import File from "../models/file.model.js";
import { createNotification } from "../utils/createNotification.js";
import { sendEmail } from "../services/email.service.js";
import { sendNotification } from "./notificaton.controller.js";

//  Get Single Request
export const getRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findOne({
      _id: requestId,
      user: { $ne: req.user._id },
    })
      .populate("user", "-password")
      .populate("admin", "username email phone locality")
      .populate({
        path: "file",
        populate: {
          path: "uploadedBy",
          model: "User",
          select: "username email phone locality",
        },
      });

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// get user request
export const getUserRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await Request.find({
      user: userId,
      type: { $ne: "account" },
    })
      .populate("file")
      .populate("admin", "username email phone")
      .sort({ createdAt: -1 });

    if (!requests) {
      f;
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// get all requests
export const getRequests = async (req, res) => {
  const { status } = req.params;
  const ALLOWED_STATUSES = ["pending", "rejected", "approved"];
  try {
    if (status !== "all" && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status parameter. Must be 'all' or one of: ${ALLOWED_STATUSES.join(
          ", "
        )}.`,
      });
    }
    const query = {
      user: { $ne: req.user._id },
    };

    if (status !== "all") {
      query.status = status;
    }

    const requests = await Request.find(query)
      .populate("user", "-password")
      .populate("file", "name path size createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { requests } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// get requests count
export const getRequestsCount = async (req, res) => {
  try {
    const result = await Request.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {
      pending: 0,
      rejected: 0,
      approved: 0,
    };

    result.forEach((r) => {
      counts[r._id] = r.count;
    });

    res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    console.error("Error fetching document status counts:", error);
    res.status(500).json({
      success: false,
      error: "Server Error: Could not retrieve status counts.",
    });
  }
};

// Approve request
export const approveRequest = async (req, res) => {
  try {
    const { itemPrice, serviceCost, shippingCost, itemRentalCost, offerType } =
      req.body;
    const { requestId } = req.params;

    let request = await Request.findOneAndUpdate(
      { _id: requestId, status: "pending" },
      {
        status: "approved",
        admin: req?.user?.id,
      }
    )
      .populate("user", "-password")
      .populate("file");

    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Invalid Request!" });

    if (request.type === "account") {
      await User.findByIdAndUpdate(request?.user?._id, {
        status: "approved",
        approvedAt: Date.now(),
      });
    } else if (request.type === "upload" && request.file) {
      await File.findByIdAndUpdate(request.file._id, {
        status: "approved",
        itemPrice,
        serviceCost,
        shippingCost,
        itemRentalCost,
        offerType,
      });
    }

    const notifyMessage =
      request.type === "account"
        ? "Your account has been approved."
        : `Your item request has been approved.`;

    await createNotification({
      user: request.user._id,
      type: request.type,
      message: notifyMessage,
      roleFor: "user",
      request: request._id,
    });

    request = await Request.findById(request._id)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "file",
        populate: {
          path: "uploadedBy",
          model: "User",
          select: "username email phone locality",
        },
      })
      .populate({
        path: "admin",
        model: "User",
        select: "username email phone locality",
      });


    await sendNotification(request.user?._id, notifyMessage, request.type === 'account' ? "Welcome! Your account has been approved. You now have full access." : `Your request for ${request.type} has been approved. See Details.`)

    if (request.user?.email) {
      let template = "";
      let variables = {};

      if (request.type === "account") {
        template = "accountApproved";
        variables.username = request.user?.username;
      } else {
        template = "fileApproved";
        variables.username = request?.user?.username;
        variables.type =
          request?.type === "upload" ? "Upload" : request?.requestType;
        variables.file = request?.file;
      }

      await sendEmail(request.user?.email, notifyMessage, template, variables);
    }

    res.json({
      success: true,
      message: "Request has been approved.",
      request,
    });
  } catch (err) {
    console.error("approveRequest error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reject Request
export const rejectRequest = async (req, res) => {
  try {
    const {
      message,
      itemPrice,
      serviceCost,
      shippingCost,
      itemRentalCost,
      offerType,
    } = req.body;
    const { requestId } = req.params;

    let request = await Request.findOneAndUpdate(
      { _id: requestId, status: "pending" },
      {
        status: "rejected",
        admin: req?.user?.id,
        message,
      }
    )
      .populate("user", "-password")
      .populate("file");

    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Invalid Request!" });

    const notifyMessage =
      request.type === "account"
        ? "Your account has been rejected."
        : `Your item request was rejected.`;

    await createNotification({
      user: request.user._id,
      type: request.type,
      message: notifyMessage,
      roleFor: "user",
      request: request._id,
    });

    if (request.type === "account") {
      await User.findByIdAndUpdate(request.user._id, { status: "rejected" });
    }

    if (request.type === "upload" && request.file) {
      await File.findByIdAndUpdate(request.file._id, {
        status: "rejected",
        itemPrice,
        serviceCost,
        shippingCost,
        itemRentalCost,
        offerType,
      });
    }

    request = await Request.findById(request._id)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "file",
        populate: {
          path: "uploadedBy",
          model: "User",
          select: "username email phone locality",
        },
      })
      .populate({
        path: "admin",
        model: "User",
        select: "username email phone locality",
      });

    await sendNotification(request.user?._id, notifyMessage, request.type === 'account' ? "Your account registration could not be approved at this time." : `Your request for ${request.type} was not approved. Check the app for details.`)

    if (request.user?.email) {
      let template = "";
      let variables = {};
      if (request.type === "account") {
        template = "accountRejected";
        variables.username = request.user?.username;
        variables.reason = message;
      } else {
        template = "fileRejected";
        variables.type =
          request?.type === "upload" ? "Upload" : request?.requestType;
        variables.username = request?.user?.username;
        variables.reason = message;
        variables.file = request?.file;
      }

      await sendEmail(request.user?.email, notifyMessage, template, variables);
    }

    res.json({
      success: true,
      message: "Request has been rejected.",
      request,
    });
  } catch (err) {
    console.error("rejectRequest error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
