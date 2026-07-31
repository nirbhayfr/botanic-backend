import express from "express";
import { seedSiteContent } from "../controllers/SiteSeed.js";
import { adminMiddleware, authMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/site-content", authMiddleware, adminMiddleware, seedSiteContent);

export default router;
