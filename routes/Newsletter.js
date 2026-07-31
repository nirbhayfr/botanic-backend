import express from "express";

import {
	createNewsletter,
	getNewsletters,
	getSingleNewsletter,
	updateNewsletter,
	unsubscribeNewsletter,
	deleteNewsletter,
} from "../controllers/Newsletter.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/", createNewsletter);
router.put("/unsubscribe/:email", unsubscribeNewsletter);
router.get("/", authMiddleware, adminMiddleware, getNewsletters);
router.get("/:id", authMiddleware, adminMiddleware, getSingleNewsletter);
router.put("/:id", authMiddleware, adminMiddleware, updateNewsletter);
router.delete("/:id", authMiddleware, adminMiddleware, deleteNewsletter);

export default router;
