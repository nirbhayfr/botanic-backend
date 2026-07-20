import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { products } from "./productSeedData.js";

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

const fallbackImages = [
	"/assets/img/p-1.jpeg",
	"/assets/img/p-2.jpeg",
	"/assets/img/p-3.jpeg",
	"/assets/img/p-4.jpeg",
	"/assets/img/p-5.jpeg",
	"/assets/img/p-6.jpeg",
];

const fillMissingDetailData = async () => {
	const allProducts = await Product.find({}).sort({ createdAt: 1 });
	const allSlugs = allProducts.map((product) => product.slug);

	for (const [index, product] of allProducts.entries()) {
		const image = product.images?.[0]?.url || fallbackImages[index % fallbackImages.length];
		const basePrice = Number(product.salePrice || product.price || 499);
		const originalPrice = Number(product.price || basePrice);
		const concern = product.concern || "Everyday Wellness";

		if (!product.images?.length) product.images = [{ url: image }];
		if (!product.longDescription) product.longDescription = `${product.title} is a thoughtfully prepared Ayurvedic wellness product designed to support ${concern.toLowerCase()} as part of a consistent daily routine.`;
		if (!product.tagline) product.tagline = `Simple daily support for ${concern.toLowerCase()}`;
		if (!product.quantity) product.quantity = "60 Servings";
		if (!product.dosage) product.dosage = "Take one serving once or twice daily after meals with water.";
		if (!product.suitableFor) product.suitableFor = "Adults";
		if (!product.certifications?.length) product.certifications = ["GMP Certified", "Lab Tested", "Made in India"];
		if (!product.benefits?.length) product.benefits = ["Supports everyday wellness", `Helps maintain ${concern.toLowerCase()}`, "Easy to include in a daily routine"];

		product.ingredients = product.ingredients?.length
			? product.ingredients.map((ingredient) => ({
				name: ingredient.name || "Ayurvedic Botanical Blend",
				amount: ingredient.amount || "Standardized serving",
				benefit: ingredient.benefit || `Traditionally used for ${concern.toLowerCase()}`,
				image: ingredient.image || image,
			}))
			: [{ name: "Ayurvedic Botanical Blend", amount: "Standardized serving", benefit: `Traditionally used for ${concern.toLowerCase()}`, image }];

		if (!product.pricingTiers?.length) product.pricingTiers = [
			{ bottles: 1, duration: "1 Month", price: basePrice },
			{ bottles: 2, duration: "2 Months", price: Math.round(basePrice * 1.8), originalPrice: Math.round(originalPrice * 2), badge: "Best Value" },
			{ bottles: 3, duration: "3 Months", price: Math.round(basePrice * 2.55), originalPrice: Math.round(originalPrice * 3) },
		];
		if (!product.keyBenefits?.length) product.keyBenefits = product.benefits.slice(0, 3).map((benefit) => ({ title: benefit, description: `Formulated to support ${concern.toLowerCase()} with consistent use.` }));
		if (!product.productDetails?.length) product.productDetails = [product.quantity, "Quality-tested ingredients", "Made in a GMP-certified facility", "Designed for daily use"];
		if (!product.usageLevels?.length) product.usageLevels = [{ label: "Daily Support", tablets: 1, frequency: product.dosage }];
		if (!product.aboutParagraphs?.length) product.aboutParagraphs = [
			`${product.title} combines Ayurvedic tradition with a convenient modern format.`,
			`The formula is prepared in quality-controlled batches to support ${concern.toLowerCase()} and consistent everyday use.`,
		];
		if (!product.benefitsIntro) product.benefitsIntro = `Each component is selected to complement the formula's focus on ${concern.toLowerCase()}.`;
		if (!product.ingredientsIntro) product.ingredientsIntro = "A focused selection of Ayurvedic botanicals chosen for quality, compatibility, and traditional use.";
		if (!product.howItWorks) product.howItWorks = `With regular use, ${product.title} supports the body's natural wellness processes and helps maintain a balanced routine.`;
		if (!product.testimonialsIntro) product.testimonialsIntro = `Customers share how ${product.title} fits into their everyday wellness routine.`;
		if (!product.testimonials?.length) product.testimonials = [{ name: "Verified Customer", role: "Product user", quote: "The product is easy to use and has fitted naturally into my daily routine.", image }];
		if (!product.faqs?.length) product.faqs = [
			{ question: "How should I use this product?", answer: product.dosage },
			{ question: "How long until I see results?", answer: "Individual results vary. Use consistently for 3–4 weeks before assessing how it fits your routine." },
			{ question: "How should I store it?", answer: "Store in a cool, dry place away from direct sunlight and keep the pack tightly closed." },
			{ question: "Is Cash on Delivery available?", answer: "Yes, Cash on Delivery is available for eligible Indian pin codes." },
		];
		if (!product.claims?.length) product.claims = ["Pure Ayurvedic Extracts", "Non-Habit Forming", "No Added Sugar", "Quality Tested"];
		if (!product.commitmentParagraph) product.commitmentParagraph = "Every batch is checked for identity, purity, and consistency. We use carefully sourced ingredients and transparent labels for dependable daily wellness.";
		if (!product.prepaidOffer) product.prepaidOffer = "Get an extra 10% off on prepaid orders";
		if (!product.safetyNotice) product.safetyNotice = "Consult your physician before use if you are pregnant, nursing, have a medical condition, or take prescription medication. Keep out of reach of children.";
		if (!product.relatedIds?.length) product.relatedIds = allSlugs.filter((slug) => slug !== product.slug).slice(0, 3);

		await product.save();
	}

	return allProducts.length;
};

const seed = async () => {
	await connectDB({ serverSelectionTimeoutMS: 15000 });

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
						images: product.images || [],
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
						pricingTiers: product.pricingTiers || [],
						keyBenefits: product.keyBenefits || [],
						productDetails: product.productDetails || [],
						usageLevels: product.usageLevels || [],
						testimonials: product.testimonials || [],
						faqs: product.faqs || [],
						claims: product.claims || [],
						aboutParagraphs: product.aboutParagraphs || [],
						benefitsIntro: product.benefitsIntro,
						ingredientsIntro: product.ingredientsIntro,
						howItWorks: product.howItWorks,
						testimonialsIntro: product.testimonialsIntro,
						commitmentParagraph: product.commitmentParagraph,
						prepaidOffer: product.prepaidOffer,
						safetyNotice: product.safetyNotice,
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

	const backfilledCount = await fillMissingDetailData();
	console.log(`Detail-page data checked/backfilled for ${backfilledCount} products.`);

	await mongoose.disconnect();
};

seed().catch(async (error) => {
	console.error(error);
	await mongoose.disconnect();
	process.exit(1);
});
