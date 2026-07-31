import express from "express";

import {
	createContentType,
	getContentTypes,
	getSingleContentType,
	updateContentType,
	deleteContentType,
} from "../controllers/ContentType.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createContentType);
router.get("/", getContentTypes);
router.get("/:id", getSingleContentType);
router.put("/:id", authMiddleware, adminMiddleware, updateContentType);
router.delete("/:id", authMiddleware, adminMiddleware, deleteContentType);

export default router;
