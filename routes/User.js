import express from "express";
import {
	getAddress,
	loginUser,
	registerUser,
	setAddress,
	getAllUsers,
	updateUser,
	deleteUser,
	getMe,
} from "../controllers/User.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);
router.get("/address", authMiddleware, getAddress);
router.put("/address", authMiddleware, setAddress);

// Admin routes
router.get("/", authMiddleware, adminMiddleware, getAllUsers);
router.put("/:id", authMiddleware, adminMiddleware, updateUser);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;

