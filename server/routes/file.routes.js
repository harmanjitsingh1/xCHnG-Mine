import express from "express";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";
import {
  getUploadUrl,
  saveMetadata,
  getDownloadUrl,
  searchFiles,
  getAllFiles,
  getFileById,
  generateDownloadRequest,
  generateUploadRequest,
  toggleFileAvailability
} from "../controllers/file.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getAllFiles);

router.post("/get-upload-url", isAuthenticated, getUploadUrl);

router.post("/save-metadata", isAuthenticated, saveMetadata);

router.get("/get-download-url", isAuthenticated, getDownloadUrl);

router.get("/search", isAuthenticated, searchFiles);

router.get("/detail/:fileId", isAuthenticated, getFileById);

router.get("/download/:fileId/:requestType", isAuthenticated, generateDownloadRequest);

router.get("/upload/:fileId", isAuthenticated, generateUploadRequest);

router.put("/toggle-file-availability", isAuthenticated, isAdmin, toggleFileAvailability);

export default router;
