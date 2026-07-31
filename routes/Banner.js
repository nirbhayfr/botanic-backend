import express from "express";

import {
	createBanner,
	getBanners,
	getSingleBanner,
	updateBanner,
	deleteBanner,
	getBannersByPosition,
} from "../controllers/Banner.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createBanner);
router.get("/", getBanners);
router.get("/position/:position", getBannersByPosition);
router.get("/:id", getSingleBanner);
router.put("/:id", authMiddleware, adminMiddleware, updateBanner);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBanner);

export default router;
