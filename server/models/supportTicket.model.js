import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  screenshots: [
    {
      fileName: { type: String },
      fileKey: { type: String },
    },
  ],
  status: {
    type: String,
    enum: ["open", "in-progress", "resolved"],
    default: "open",
  },
  createdAt: { type: Date, default: Date.now },
});

export const SupportTicket = mongoose.model(
  "SupportTicket",
  supportTicketSchema,
);
