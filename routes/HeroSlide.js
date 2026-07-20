import express from "express";
import { createHeroSlide, deleteHeroSlide, getHeroSlides, updateHeroSlide } from "../controllers/HeroSlide.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();
router.get("/", getHeroSlides);
router.post("/", authMiddleware, adminMiddleware, createHeroSlide);
router.put("/:id", authMiddleware, adminMiddleware, updateHeroSlide);
router.delete("/:id", authMiddleware, adminMiddleware, deleteHeroSlide);
export default router;
