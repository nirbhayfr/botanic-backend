import express from "express";

import {
	createReview,
	getProductReviews,
	updateReview,
	deleteReview,
} from "../controllers/Review.js";
import { authMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/", authMiddleware, createReview);
router.get("/product/:productId", getProductReviews);
router.put("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

export default router;
