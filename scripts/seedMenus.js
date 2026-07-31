import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import Menu from "../models/Menu.js";

const menus = [
	{
		name: "Header Menu",
		location: "header",
		items: [
			{ label: "Home", url: "/", order: 0, target: "_self" },
			{ label: "Shop", url: "/shop", order: 1, target: "_self" },
			{ label: "Consultation", url: "/consultations", order: 2, target: "_self" },
			{ label: "Our Story", url: "/about", order: 3, target: "_self" },
			{ label: "Blog", url: "/blog", order: 4, target: "_self" },
		],
	},
	{
		name: "Mobile Menu",
		location: "mobile",
		items: [
			{ label: "Home", url: "/", order: 0, target: "_self" },
			{ label: "Shop All", url: "/shop", order: 1, target: "_self" },
			{ label: "My Orders", url: "/orders", order: 2, target: "_self" },
			{ label: "Consultation", url: "/consultations", order: 3, target: "_self" },
			{ label: "Ingredients", url: "/ingredients", order: 4, target: "_self" },
			{ label: "Our Story", url: "/about", order: 5, target: "_self" },
			{ label: "Blog", url: "/blog", order: 6, target: "_self" },
		],
	},
	{
		name: "Footer Menu",
		location: "footer",
		items: [
			{ label: "Shop All", url: "/shop", order: 0, target: "_self" },
			{ label: "Consultation", url: "/consultations", order: 1, target: "_self" },
			{ label: "Ingredients", url: "/ingredients", order: 2, target: "_self" },
			{ label: "Our Story", url: "/about", order: 3, target: "_self" },
			{ label: "Blog", url: "/blog", order: 4, target: "_self" },
			{ label: "My Orders", url: "/orders", order: 5, target: "_self" },
			{ label: "Sign In", url: "/login", order: 6, target: "_self" },
			{ label: "Create Account", url: "/register", order: 7, target: "_self" },
		],
	},
];

const seedMenus = async () => {
	try {
		await connectDB();

		for (const menu of menus) {
			await Menu.findOneAndUpdate(
				{ location: menu.location },
				menu,
				{
					upsert: true,
					new: true,
					runValidators: true,
					setDefaultsOnInsert: true,
				},
			);
		}

		console.log(`Seeded ${menus.length} API-driven navigation menus.`);
	} catch (error) {
		console.error("Menu seed failed:", error.message);
		process.exitCode = 1;
	} finally {
		await mongoose.connection.close();
	}
};

seedMenus();
