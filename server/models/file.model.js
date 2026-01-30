import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
  },
  fileKey: {
    type: String,
    required: true,
    unique: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileType: {
    type: String,
  },
  status: {
    type: String,
    enum: ["approved", "pending", "rejected"],
    default: "pending",
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  itemPrice: {
    type: String,
    default: "",
  },
  serviceCost: {
    type: String,
    default: "",
  },
  shippingCost: {
    type: String,
    default: "",
  },
  itemRentalCost: {
    type: String,
    default: "",
  },
  offerType: {
    type: String,
    default: "Exchange/Sale/Donate/Rent",
  },
  availability: {
    type: Boolean,
    default: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
});

const File = mongoose.model("File", fileSchema);
export default File;
