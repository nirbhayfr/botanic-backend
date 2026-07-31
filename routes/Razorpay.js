import express from "express";
import {
	createOrder,
	verifyPayment,
} from "../controllers/Razorpay.js";
import { authMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/create-order", authMiddleware, createOrder);
router.post("/verify", authMiddleware, verifyPayment);

export default router;
