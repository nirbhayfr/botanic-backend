import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { products } from "../../frontend/src/utils/data.js";

const toSlug = (value) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

const categoryDefs = [
	{
		name: "Capsules",
		slug: "capsules",
		description: "Premium herbal capsules with standardized extracts for targeted daily wellness.",
		image: "/assets/img/pe-5.png",
		isFeatured: true,
		status: "active",
	},
	{
		name: "Juices",
		slug: "juices",
		description: "Cold-processed botanical juices derived from classical Ayurvedic herbs.",
		image: "/assets/img/slider-1.png",
		isFeatured: true,
		status: "active",
	},
];

const seed = async () => {
	await connectDB();

	console.log("Seeding categories...");
	const categoryMap = {};
	for (const cat of categoryDefs) {
		const doc = await Category.findOneAndUpdate(
			{ slug: cat.slug },
			{ $set: cat },
			{ upsert: true, new: true },
		);
		categoryMap[cat.name] = doc._id;
		console.log(`Category seeded: ${cat.name} (${doc._id})`);
	}

	console.log("Seeding products...");
	const operations = products.map((product) => {
		const catId = categoryMap[product.category];
		return {
			updateOne: {
				filter: { slug: product.id || toSlug(product.title) },
				update: {
					$set: {
						title: product.title,
						slug: product.id || toSlug(product.title),
						description: product.description,
						longDescription: product.longDescription,
						price: product.price,
						stock: 100,
						sku: (product.id || toSlug(product.title)).toUpperCase(),
						category: catId,
						categoryName: product.category,
						concern: product.concern,
						images: product.image ? [{ url: product.image }] : [],
						badge: product.badge,
						priceLabel: product.priceLabel,
						tagline: product.tagline,
						quantity: product.quantity,
						dosage: product.dosage,
						ingredients: product.ingredients || [],
						benefits: product.benefits || [],
						suitableFor: product.suitableFor,
						certifications: product.certifications || [],
						relatedIds: product.relatedIds || [],
						isFeatured: true,
						status: "active",
					},
				},
				upsert: true,
			},
		};
	});

	const result = await Product.bulkWrite(operations);

	console.log(
		`Seeded products: ${result.upsertedCount} inserted, ${result.modifiedCount} updated`,
	);

	await mongoose.disconnect();
};

seed().catch(async (error) => {
	console.error(error);
	await mongoose.disconnect();
	process.exit(1);
});
