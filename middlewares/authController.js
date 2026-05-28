import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ error: "No token provided" });
		}

		const token = authHeader.substring(7);

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decoded.userId;
		req.user = decoded;

		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ error: "Token expired" });
		}
		return res.status(401).json({ error: "Invalid token" });
	}
};

export const adminMiddleware = async (req, res, next) => {
	try {
		if (!req.userId) {
			return res.status(401).json({ error: "Unauthorized" });
		}
		const user = await User.findById(req.userId);
		if (!user || user.role !== "admin") {
			return res.status(403).json({ error: "Access denied. Admin role required." });
		}
		req.user = user;
		next();
	} catch (error) {
		return res.status(500).json({ error: "Server error in admin authorization" });
	}
};

