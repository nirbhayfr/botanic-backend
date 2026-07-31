import express from "express";

import {
	createProduct,
	getProducts,
	getSingleProduct,
	updateProduct,
	deleteProduct,
	seedProducts,
} from "../controllers/Product.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";
import { generateProductDetails } from "../controllers/ProductAI.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createProduct);
router.post("/generate-details", authMiddleware, adminMiddleware, generateProductDetails);
router.post("/seed", authMiddleware, adminMiddleware, seedProducts);
router.get("/", getProducts);
router.get("/:id", getSingleProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
