import express from "express";

import {
	createOrder,
	getMyOrders,
	getSingleOrder,
	updateOrderStatus,
	cancelOrder,
	payOrder,
	createRazorpayCheckout,
	getAllOrders,
	getOrderStats,
} from "../controllers/Order.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

// Admin-specific endpoints
router.get("/", authMiddleware, adminMiddleware, getAllOrders);
router.get("/stats", authMiddleware, adminMiddleware, getOrderStats);

// User endpoints
router.post("/", authMiddleware, createOrder);
router.post("/razorpay", authMiddleware, createRazorpayCheckout);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getSingleOrder);

// Status and payment updates (Admin only)
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);
router.put("/:id/pay", authMiddleware, adminMiddleware, payOrder);

// Order cancellation (User)
router.put("/:id/cancel", authMiddleware, cancelOrder);

export default router;
