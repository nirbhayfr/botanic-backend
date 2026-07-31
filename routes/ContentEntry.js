import express from "express";

import {
	createContentEntry,
	getContentEntries,
	getSingleContentEntry,
	updateContentEntry,
	deleteContentEntry,
	getContentEntriesByType,
} from "../controllers/ContentEntry.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createContentEntry);
router.get("/", getContentEntries);
router.get("/type/:slug", getContentEntriesByType);
router.get("/:id", getSingleContentEntry);
router.put("/:id", authMiddleware, adminMiddleware, updateContentEntry);
router.delete("/:id", authMiddleware, adminMiddleware, deleteContentEntry);

export default router;
