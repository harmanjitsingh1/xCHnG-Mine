import express from "express";
import {
  getRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  getUserRequests,
  getRequestsCount,
} from "../controllers/request.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/count", isAuthenticated, isAdmin, getRequestsCount);

router.get("/:status", isAuthenticated, isAdmin, getRequests);

router.get("/user/requests", isAuthenticated, getUserRequests);

router.get("/detail/:requestId", isAuthenticated, isAdmin, getRequestById);

router.put("/:requestId/approve", isAuthenticated, isAdmin, approveRequest);

router.put("/:requestId/reject", isAuthenticated, isAdmin, rejectRequest);

export default router;
