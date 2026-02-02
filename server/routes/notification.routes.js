import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  getNotifications, updateFCMToken
} from "../controllers/notificaton.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getNotifications);

router.post("/update-fcm-token", updateFCMToken);

export default router;
