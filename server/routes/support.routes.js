import express from "express";
import { createTicket, getUploadUrls } from "../controllers/support.controller.js";

const router = express.Router();

router.post("/create-ticket", createTicket);
router.post("/get-upload-urls", getUploadUrls);

export default router;
