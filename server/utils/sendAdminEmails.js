import { sendEmail } from "../services/email.service.js";
import User from "../models/user.model.js";

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
      }
    }
  } catch (err) {
    console.error("Error sending admin notifications:", err.message);
  }
};
