import express from "express";
import {
  findUser,
  findUserById,
  saveUserChanges,
} from "../controllers/admin.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/find-user", isAuthenticated, isAdmin, findUser);

router.post("/find-user-by-id/:userId", isAuthenticated, isAdmin, findUserById);

router.put("/save-user-changes", isAuthenticated, isAdmin, saveUserChanges);

export default router;
