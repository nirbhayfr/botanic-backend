import express from "express";

import {
	createMenu,
	getMenus,
	getSingleMenu,
	getMenuByLocation,
	updateMenu,
	deleteMenu,
} from "../controllers/Menu.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createMenu);

router.get("/", getMenus);

router.get("/location/:location", getMenuByLocation);

router.get("/:id", getSingleMenu);

router.put("/:id", authMiddleware, adminMiddleware, updateMenu);

router.delete("/:id", authMiddleware, adminMiddleware, deleteMenu);

export default router;
