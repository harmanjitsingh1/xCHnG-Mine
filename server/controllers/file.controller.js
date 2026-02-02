// import { bucket } from "../config/firebase.js";
import { supabase } from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";
import File from "../models/file.model.js";
import { createNotification } from "../utils/createNotification.js";
import Request from "../models/request.model.js";
import { sendEmail } from "../services/email.service.js";
import { sendAdminEmails } from "../utils/sendAdminEmails.js";

export const getUploadUrl = async (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName) {
      return res.status(400).json({ success: false, message: "Missing info" });
    }

    const fileKey = `uploads/${Date.now()}-${uuidv4()}-${fileName}`;

    // Generate a signed upload URL (valid for 5 mins)
    const { data, error } = await supabase.storage
      .from("xCHnG-Test") // Ensure this bucket exists in Supabase
      .createSignedUploadUrl(fileKey);

    if (error) throw error;

    res.json({ uploadUrl: data.signedUrl, fileKey });
  } catch (error) {
    console.error("Supabase Sign Error:", error);
    res.status(500).json({ message: "Failed to generate upload URL" });
  }
};

export const saveMetadata = async (req, res) => {
  try {
    const {
      fileKey,
      originalName,
      fileSize,
      fileType,
      tags,
      itemPrice,
      itemRentalCost,
      offerType,
    } = req.body;

    if (!fileKey) return res.status(400).json({ message: "fileKey required" });

    const fileDoc = {
      originalName,
      fileKey,
      fileSize,
      fileType,
      uploadedBy: req.user?._id,
      status: "pending",
      tags,
      itemPrice,
      itemRentalCost,
      offerType,
      createdAt: new Date(),
    };

    const data = await File.create(fileDoc);

    const fileObject = data.toObject();

    fileObject.uploadedBy = {
      username: req.user?.username,
      email: req.user?.email,
    };

    const newRequest = await Request.create({
      user: req.user?._id,
      file: data,
      type: "upload",
      status: "pending",
    });

    await createNotification({
      user: req?.user?._id,
      roleFor: "admin",
      type: "upload",
      message: `${req?.user?.username} requested to upload an item.`,
      request: newRequest?._id,
    });
    
    await sendAdminEmails("New Item Uploaded by User", "fileRequest", {
      me: req.user?._id,
      user: {
        username: req?.user?.username,
        email: req?.user?.email,
        phone: req?.user?.phone,
      },
      type: "upload",
      file: fileDoc,
      requestId: newRequest?._id,
      requestDate: new Date(newRequest?.createdAt).toLocaleString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }),
    });

    if (req.user?.email) {
      const variables = {
        username: req.user?.username,
        file: fileDoc,
        type: "upload",
        status: "Pending",
        requestDate: new Date(newRequest.createdAt).toLocaleString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        }),
      };

      await sendEmail(
        req.user?.email,
        "We've Recieved Your Upload Request",
        "userFileRequest",
        variables,
      );
    }

    res.json({ success: true, file: fileObject });
  } catch (error) {
    console.error("Save metadata error:", error);
    res.status(500).json({ message: "Failed to save metadata" });
  }
};

export const getDownloadUrl = async (req, res) => {
  try {
    const { fileKey } = req.query;
    if (!fileKey) return res.status(400).json({ message: "fileKey required" });

    // const file = bucket.file(fileKey);
    // const [downloadUrl] = await file.getSignedUrl({
    //   version: "v4",
    //   action: "read",
    //   expires: Date.now() + 5 * 60 * 1000, // 5 min
    // });

    const { data } = await supabase.storage
      .from("xCHnG-Test")
      .createSignedUrl(fileKey, 60); // URL expires in 60 seconds

    res.json({ url: data.signedUrl });
  } catch (error) {
    console.error("Download URL error:", error);
    res.status(500).json({ message: "Failed to generate download URL" });
  }
};

export const getAllFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page ?? "1", 10);
    const limit = parseInt(req.query.limit ?? "12", 10);
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      File.find({ status: "approved" })
        .populate("uploadedBy", "username email")
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(limit),
      File.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      data: files,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + files.length < total,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const searchFiles = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page ?? "1", 10);
    const limit = parseInt(req.query.limit ?? "12", 10);

    if (!query || !query.trim()) {
      return res.json({
        files: [],
        pagination: { total: 0, page, limit, hasMore: false },
      });
    }

    const searchRegex = new RegExp(query, "i");
    const filter = {
      $or: [
        { originalName: searchRegex },
        { fileType: searchRegex },
        { tags: searchRegex },
      ],
      status: "approved",
    };

    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      File.find(filter)
        .populate("uploadedBy", "username email")
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(limit),
      File.countDocuments(filter),
    ]);

    res.json({
      files,
      pagination: { total, page, limit, hasMore: skip + files.length < total },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Error searching files" });
  }
};

export const getFileById = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { type } = req.query;

    const file = await File.findOne({
      _id: fileId,
    }).populate("uploadedBy", "username email");

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    const reqFilter = { file: fileId, user: req.user?._id };
    if (!type) {
      type =
        file.uploadedBy?._id.toString() === req.user?._id.toString()
          ? "upload"
          : "download";
    }

    const request = await Request.findOne(reqFilter)
      .sort({ createdAt: -1 })
      .limit(1);

    const meta = {
      reqStatus: request?.status,
      reqType: request?.type,
    };

    if (
      file.status !== "approved" &&
      req.user?.role !== "admin" &&
      file.uploadedBy?._id.toString() !== req.user?._id.toString()
    ) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    return res.json({ success: true, data: { ...file.toObject(), meta } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generateDownloadRequest = async (req, res) => {
  try {
    const { fileId, requestType } = req.params;

    if (!fileId) return res.status(400).json({ message: "Invalid file ID." });
    if (!requestType)
      return res.status(400).json({ message: "Request type is required." });

    const file = await File.findOne({ _id: fileId }).populate({
      path: "uploadedBy",
      model: "User",
      select: "username email phone locality",
    });

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    const newRequest = await Request.create({
      user: req.user?._id,
      file,
      type: "download",
      status: "pending",
      requestType,
    });

    await createNotification({
      user: req.user?._id,
      roleFor: "admin",
      type: "download",
      message: `${req.user?.username} requested to ${requestType} an item.`,
      request: newRequest._id,
    });

    if (req.user?.email) {
      const variables = {
        username: req.user?.username,
        type: requestType,
        status: "Pending",
        file,
        requestDate: new Date(newRequest?.createdAt).toLocaleString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        }),
      };

      await sendEmail(
        req?.user?.email,
        "We've Recieved Your Request to Exchange/Buy/Rent an item",
        "userFileRequest",
        variables,
      );
    }

    await sendAdminEmails(
      "User Requested to Exchange/Buy/Rent an Item.",
      "fileRequest",
      {
        user: {
          username: req?.user?.username,
          email: req?.user?.email,
          phone: req?.user?.phone,
        },
        me: req.user?._id,
        type: requestType,
        file,
        fileName: file?.originalName,
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
      },
    );

    res.json({
      success: true,
      message: "Request generated. You will be notified once approved.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Generate download request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate download request.",
    });
  }
};

export const generateUploadRequest = async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!fileId) return res.status(400).json({ message: "Invalid file ID." });

    const file = await File.findOne({ _id: fileId });

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    const newRequest = await Request.create({
      user: req.user?._id,
      file,
      type: "upload",
      status: "pending",
    });

    await createNotification({
      user: req.user?._id,
      roleFor: "admin",
      type: "upload",
      message: `${req.user?.username} requested to upload an item.`,
      request: newRequest._id,
    });

    if (req.user?.email) {
      const variables = {
        username: req?.user?.username,
        type: "upload",
        status: "Pending",
        file,
        requestDate: new Date(newRequest?.createdAt).toLocaleString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        }),
      };
      await sendEmail(
        req?.user?.email,
        "We've Recieved Your Request to Upload an item",
        "userFileRequest",
        variables,
      );
    }

    await sendAdminEmails(
      "User Requested to Reupload an Item.",
      "fileRequest",
      {
        user: {
          username: req?.user?.username,
          email: req?.user?.email,
          phone: req?.user?.phone,
        },
        me: req.user?._id,
        type: "upload",
        file,
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
      },
    );

    res.json({
      success: true,
      message: "Upload request sent. You will be notified once approved.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Generate upload request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate upload request.",
    });
  }
};

export const toggleFileAvailability = async (req, res) => {
  try {
    const { fileId, availability } = req.body;

    if (!fileId) return res.status(400).json({ message: "Invalid file Id." });

    let file = await File.findOneAndUpdate(
      {
        _id: fileId,
      },
      { availability: availability },
    );

    console.log(file);

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    res.json({
      success: true,
      message: `Mark as ${availability ? "Available" : "Not Available"}`,
      file: { _id: fileId, availability },
    });
  } catch (error) {
    console.error("Toggle availability error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change item availability.",
    });
  }
};
