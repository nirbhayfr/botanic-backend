import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import Banner from "../models/Banner.js";
import Category from "../models/Category.js";
import ContentEntry from "../models/ContentEntry.js";
import Page from "../models/Page.js";
import Post from "../models/Post.js";
import Product from "../models/Product.js";
import Settings from "../models/Settings.js";

const legacyProductImages = Object.fromEntries(
	Array.from({ length: 8 }, (_, index) => {
		const number = index + 1;
		const deployedNumber = number > 6 ? number - 6 : number;
		return [`/p-${number}.png`, `/assets/img/p-${deployedNumber}.jpeg`];
	}),
);

const normalizeAsset = (value) => {
	if (typeof value !== "string" || !value) return value;
	const withoutLocalhost = value.replace(/^https?:\/\/(localhost|127\.0\.0\.1):\d+/i, "");
	return legacyProductImages[withoutLocalhost] || withoutLocalhost;
};

const migrate = async () => {
	try {
		await connectDB();
		let changed = 0;

		for (const record of await Banner.find()) {
			const image = normalizeAsset(record.image);
			if (image !== record.image) {
				record.image = image;
				await record.save();
				changed += 1;
			}
		}

		for (const record of await Post.find()) {
			const image = normalizeAsset(record.featuredImage);
			if (image !== record.featuredImage) {
				record.featuredImage = image;
				await record.save();
				changed += 1;
			}
		}

		for (const record of await Page.find()) {
			const image = normalizeAsset(record.featuredImage);
			if (image !== record.featuredImage) {
				record.featuredImage = image;
				await record.save();
				changed += 1;
			}
		}

		for (const record of await Category.find()) {
			const image = normalizeAsset(record.image);
			if (image !== record.image) {
				record.image = image;
				await record.save();
				changed += 1;
			}
		}

		for (const record of await Product.find()) {
			let productChanged = false;
			for (const image of record.images || []) {
				const url = normalizeAsset(image.url);
				if (url !== image.url) {
					image.url = url;
					productChanged = true;
				}
			}
			if (productChanged) {
				await record.save();
				changed += 1;
			}
		}

		for (const record of await ContentEntry.find()) {
			const image = normalizeAsset(record.data?.image);
			if (image !== record.data?.image) {
				record.data = { ...record.data, image };
				record.markModified("data");
				await record.save();
				changed += 1;
			}
		}

		const settings = await Settings.findOne();
		if (settings) {
			const logo = normalizeAsset(settings.logo);
			const favicon = normalizeAsset(settings.favicon);
			if (logo !== settings.logo || favicon !== settings.favicon) {
				settings.logo = logo;
				settings.favicon = favicon;
				await settings.save();
				changed += 1;
			}
		}

		console.log(`Migrated deployment asset URLs in ${changed} records.`);
	} catch (error) {
		console.error("Asset URL migration failed:", error.message);
		process.exitCode = 1;
	} finally {
		await mongoose.connection.close();
	}
};

migrate();
