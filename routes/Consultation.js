import express from "express";
import jwt from "jsonwebtoken";
import {
	createConsultation,
	getMyConsultations,
	getAllConsultations,
	deleteConsultation,
} from "../controllers/Consultation.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const optionalAuthMiddleware = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith("Bearer ")) {
		const token = authHeader.substring(7);
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			req.userId = decoded.userId;
			req.user = decoded;
		} catch (error) {
			// ignore token verification errors in soft auth
		}
	}
	next();
};

const router = express.Router();

router.post("/", optionalAuthMiddleware, createConsultation);
router.get("/my-consultations", authMiddleware, getMyConsultations);

// Admin routes
router.get("/", authMiddleware, adminMiddleware, getAllConsultations);
router.delete("/:id", authMiddleware, adminMiddleware, deleteConsultation);

export default router;
