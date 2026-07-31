import express from "express";

import {
	createPage,
	getPages,
	getSinglePage,
	updatePage,
	deletePage,
	getPageBySlug,
} from "../controllers/Page.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createPage);
router.get("/", getPages);
router.get("/slug/:slug", getPageBySlug);
router.get("/:id", getSinglePage);
router.put("/:id", authMiddleware, adminMiddleware, updatePage);
router.delete("/:id", authMiddleware, adminMiddleware, deletePage);

export default router;
