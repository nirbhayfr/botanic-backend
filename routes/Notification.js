import express from "express";

import {
	createNotification,
	getNotifications,
	getSingleNotification,
	updateNotification,
	deleteNotification,
	markAsRead,
	getMyNotifications,
	markMyNotificationAsRead,
	markAllMyNotificationsAsRead,
} from "../controllers/Notification.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.get("/mine", authMiddleware, getMyNotifications);
router.put("/mine/read-all", authMiddleware, markAllMyNotificationsAsRead);
router.put("/mine/:id/read", authMiddleware, markMyNotificationAsRead);

router.use(authMiddleware, adminMiddleware);
router.post("/", createNotification);
router.get("/", getNotifications);
router.get("/:id", getSingleNotification);
router.put("/:id", updateNotification);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;
