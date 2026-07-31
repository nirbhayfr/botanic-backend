import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import Settings from "../models/Settings.js";

const settings = {
	siteName: "BE BOTANIC",
	siteDescription:
		"Premium Ayurvedic wellness formulations crafted with carefully selected botanicals, traditional wisdom, and modern quality standards.",
	logo: "/assets/img/logo.png",
	favicon: "/assets/img/icon.png",
	contactEmail: "hello@bebotanic.in",
	contactPhone: "+91 12345 67890",
	address: "India",
	socialLinks: {
		instagram: "https://www.instagram.com/",
		facebook: "https://www.facebook.com/",
		linkedin: "https://www.linkedin.com/",
		youtube: "https://www.youtube.com/",
	},
};

const seedSettings = async () => {
	try {
		await connectDB();
		await Settings.findOneAndUpdate({}, settings, {
			upsert: true,
			new: true,
			runValidators: true,
			setDefaultsOnInsert: true,
		});
		console.log("Seeded site settings with deployment-safe relative assets.");
	} catch (error) {
		console.error("Settings seed failed:", error.message);
		process.exitCode = 1;
	} finally {
		await mongoose.connection.close();
	}
};

seedSettings();
