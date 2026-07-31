import express from "express";

import {
	createContactMessage,
	getAllContactMessages,
	deleteContactMessage,
} from "../controllers/Contact.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

// Public submission
router.post("/", createContactMessage);

// Admin operations
router.get("/", authMiddleware, adminMiddleware, getAllContactMessages);
router.delete("/:id", authMiddleware, adminMiddleware, deleteContactMessage);

export default router;
