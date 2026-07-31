import express from "express";

import {
	createCoupon,
	getCoupons,
	getSingleCoupon,
	updateCoupon,
	deleteCoupon,
	validateCoupon,
} from "../controllers/Coupon.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/validate", validateCoupon);
router.post("/", authMiddleware, adminMiddleware, createCoupon);
router.get("/", authMiddleware, adminMiddleware, getCoupons);
router.get("/:id", authMiddleware, adminMiddleware, getSingleCoupon);
router.put("/:id", authMiddleware, adminMiddleware, updateCoupon);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCoupon);

export default router;
