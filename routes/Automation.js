import express from "express";

import {
	getAutomationSettings,
	getNotificationLogs,
	updateAutomationSettings,
} from "../controllers/Automation.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.get("/settings", authMiddleware, adminMiddleware, getAutomationSettings);
router.put("/settings", authMiddleware, adminMiddleware, updateAutomationSettings);
router.get("/logs", authMiddleware, adminMiddleware, getNotificationLogs);

export default router;
