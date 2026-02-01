import { SupportTicket } from "../models/supportTicket.model.js";
import { supabase } from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user.model.js";

export const getUploadUrls = async (req, res) => {
  try {
    const { files, email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide a registered Email address.",
        });
    }

    let signedUrls = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const fileKey = `User Queries/${Date.now()}-${uuidv4()}-${file}`;

        const { data, error } = await supabase.storage
          .from("xCHnG-Test")
          .createSignedUploadUrl(fileKey);

        if (error) throw error;

        signedUrls.push({ uploadUrl: data.signedUrl, fileKey, fileName: file });
      }
    }

    return res.status(200).json({ success: true, data: signedUrls });
  } catch (error) {
    console.error("Supabase Sign Error:", error);
    res.status(500).json({ message: "Failed to generate upload URL" });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { username, email, message, screenshots } = req.body;
    
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide a registered Email address.",
        });
    }

    const newTicket = await SupportTicket.create({
      user,
      username,
      email,
      message,
      screenshots,
    });

    res.status(201).json({ success: true, data: newTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
