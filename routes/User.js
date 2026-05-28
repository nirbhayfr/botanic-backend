import express from "express";
import { loginUser, registerUser, setAddress } from "../controllers/User.js";
import { authMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/address", authMiddleware, setAddress);

export default router;
