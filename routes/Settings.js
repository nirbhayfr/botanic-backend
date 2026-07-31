import express from "express";

import { getSettings, updateSettings } from "../controllers/Settings.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/", authMiddleware, adminMiddleware, updateSettings);

export default router;
