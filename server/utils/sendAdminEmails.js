import { sendEmail } from "../services/email.service.js";
import User from "../models/user.model.js";
import { sendNotification } from "../controllers/notificaton.controller.js";

export const sendAdminEmails = async (
  subject,
  templateName,
  variables = {}
) => {
  try {
    const admins = await User.find({ role: "admin", status: "approved" });
    if (!admins.length) {
      return;
    }

    for (const admin of admins) {
      if (variables.me.toString() !== admin._id.toString() && admin.email) {
        await sendEmail(admin.email, subject, templateName, variables);

        if (variables.type === "account") {
          await sendNotification(admin._id, "New User Registration", `${variables.username} has created a new account and is awaiting approval.`)
        } else if (variables.type === "upload") {
          await sendNotification(admin._id, "New Upload Received", `User ${variables.username} has uploaded a new file: ${variables.file?.originalName}.`)
        } else if (variables.type === "download") {
          await sendNotification(admin._id, "New Download Request", `A new request for ${variables.file?.originalName} has been submitted by ${variables.username}.`)
        }
      }
    }
  } catch (err) {
    console.error("Error sending admin notifications:", err.message);
  }
};
