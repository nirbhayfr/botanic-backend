import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import Banner from "../models/Banner.js";

const assetUrl = (path) => path;

const banners = [
	{
		title: "Botanical Wellness, Made Daily",
		subtitle:
			"Thoughtfully prepared Ayurvedic formulations designed to fit naturally into your everyday wellness ritual.",
		eyebrow: "Rooted in Ayurveda",
		image: assetUrl("/assets/img/hero.png"),
		buttonText: "Shop the Collection",
		buttonLink: "/shop",
		position: "homepage",
		order: 0,
		status: "active",
	},
	{
		title: "Daily Care, Powered by Plants",
		subtitle:
			"Discover precise botanical blends for energy, balance, digestion, recovery, and complete daily care.",
		eyebrow: "Plant-Based Rituals",
		image: assetUrl("/assets/img/slider-1.png"),
		buttonText: "Explore Products",
		buttonLink: "/shop",
		position: "homepage",
		order: 1,
		status: "active",
	},
	{
		title: "Ancient Wisdom, Modern Routine",
		subtitle:
			"Simple Ayurvedic formats made for consistency, transparency, and your modern lifestyle.",
		eyebrow: "The Veadya Method",
		image: assetUrl("/assets/img/slider-2.png"),
		buttonText: "Our Story",
		buttonLink: "/about",
		position: "homepage",
		order: 2,
		status: "active",
	},
];

const seedBanners = async () => {
	try {
		await connectDB();

		const seeded = [];
		for (const banner of banners) {
			const record = await Banner.findOneAndUpdate(
				{ title: banner.title, position: banner.position },
				banner,
				{
					upsert: true,
					new: true,
					runValidators: true,
					setDefaultsOnInsert: true,
				},
			);
			seeded.push(record);
		}

		console.log(
			`Seeded ${seeded.length} active homepage banners with deployment-safe relative assets.`,
		);
	} catch (error) {
		console.error("Banner seed failed:", error.message);
		process.exitCode = 1;
	} finally {
		await mongoose.connection.close();
	}
};

seedBanners();
