import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

const categories = [
	{
		name: "Capsule",
		description: "Ayurvedic capsules formulated with pure herb extracts.",
		isFeatured: true,
	},
	{
		name: "Juice",
		description: "Fresh botanical juices crafted for daily wellness.",
		isFeatured: true,
	},
	{
		name: "Drop",
		description: "Concentrated herbal drops for instant healing.",
		isFeatured: true,
	},
];

const products = [
	{
		id: 1,
		name: "Sernex+",
		category: "Capsule",
		price: 499,
		originalPrice: 649,
		size: "60 Capsules",
		description:
			"Supports stamina, vitality, strength, and daily performance naturally.",
		notes: {
			top: ["Ashwagandha", "Safed Musli"],
			heart: ["Shilajit", "Gokshura"],
			base: ["Kaunch Beej", "Saffron"],
		},
		tags: ["Capsule", "Men Wellness", "Stamina"],
		rating: 4.8,
		reviews: 154,
		bg: "#fcfbfa",
		accent: "#114232",
		textColor: "#111111",
		subColor: "#666666",
		images: ["/assets/img/p-1.jpeg"],
	},
	{
		id: 2,
		name: "Bowlease+",
		category: "Capsule",
		price: 549,
		originalPrice: 699,
		size: "60 Capsules",
		description:
			"Helps improve bowel movement and supports complete digestive comfort.",
		notes: {
			top: ["Senna Leaf", "Triphala"],
			heart: ["Haritaki", "Ajwain"],
			base: ["Fennel Seeds", "Castor Oil Extract"],
		},
		tags: ["Capsule", "Digestive Wellness", "Bowel Movement"],
		rating: 4.7,
		reviews: 112,
		bg: "#fcfbfa",
		accent: "#114232",
		textColor: "#111111",
		subColor: "#666666",
		images: ["/assets/img/p-2.jpeg"],
	},
	{
		id: 3,
		name: "Calmiva+",
		category: "Drop",
		price: 599,
		originalPrice: 799,
		size: "60 Capsules",
		description:
			"Promotes relaxation, better sleep quality, and emotional balance.",
		notes: {
			top: ["Brahmi", "Tagar Root"],
			heart: ["Jatamansi", "Ashwagandha"],
			base: ["Shankhpushpi", "Chamomile"],
		},
		tags: ["Capsule", "Stress Relief", "Sleep"],
		rating: 4.9,
		reviews: 204,
		bg: "#fcfbfa",
		accent: "#114232",
		textColor: "#111111",
		subColor: "#666666",
		images: ["/assets/img/p-3.jpeg"],
	},
	{
		id: 4,
		name: "Livo De+ Juice",
		category: "Juice",
		price: 689,
		originalPrice: 899,
		size: "1000ml",
		description:
			"Supports liver detoxification and improves overall metabolic health.",
		notes: {
			top: ["Bhumi Amla", "Punarnava"],
			heart: ["Kalmegh", "Kutki"],
			base: ["Aloe Vera", "Giloy"],
		},
		tags: ["Juice", "Liver Wellness", "Detox"],
		rating: 4.6,
		reviews: 98,
		bg: "#fcfbfa",
		accent: "#114232",
		textColor: "#111111",
		subColor: "#666666",
		images: ["/assets/img/p-4.jpeg"],
	},
	{
		id: 5,
		name: "IBGS+ Juice",
		category: "Juice",
		price: 729,
		originalPrice: 949,
		size: "1000ml",
		description:
			"Enhances digestion, gut balance, and nutrient absorption naturally.",
		notes: {
			top: ["Bel Fruit", "Kutaj Bark"],
			heart: ["Ginger", "Fennel"],
			base: ["Coriander", "Mint"],
		},
		tags: ["Juice", "Gut Wellness", "Digestion"],
		rating: 4.8,
		reviews: 145,
		bg: "#fcfbfa",
		accent: "#114232",
		textColor: "#111111",
		subColor: "#666666",
		images: ["/assets/img/p-5.jpeg"],
	},
	{
		id: 6,
		name: "Cardiva HRT+",
		category: "Capsule",
		price: 649,
		originalPrice: 849,
		size: "60 Capsules",
		description:
			"Supports healthy circulation and strengthens cardiovascular function.",
		notes: {
			top: ["Arjuna Bark", "Garlic Extract"],
			heart: ["Guggul", "Pushkarmool"],
			base: ["Grape Seed Extract", "Coenzyme Q10"],
		},
		tags: ["Capsule", "Heart Wellness", "Circulation"],
		rating: 4.7,
		reviews: 86,
		bg: "#fcfbfa",
		accent: "#114232",
		textColor: "#111111",
		subColor: "#666666",
		images: ["/assets/img/p-6.jpeg"],
	},
	{
		id: 7,
		name: "Gluvora DB+",
		category: "Juice",
		price: 799,
		originalPrice: 1099,
		size: "1000ml",
		description:
			"Helps maintain healthy sugar levels and supports metabolic wellness.",
		notes: {
			top: ["Karela (Bitter Gourd)", "Jamun (Java Plum)"],
			heart: ["Gurmar (Gymnema)", "Methi (Fenugreek)"],
			base: ["Amla", "Vijayasar Wood"],
		},
		tags: ["Juice", "Diabetic Care", "Sugar Control"],
		rating: 4.9,
		reviews: 167,
		bg: "#fcfbfa",
		accent: "#114232",
		textColor: "#111111",
		subColor: "#666666",
		images: ["/assets/img/p-1.jpeg"],
	},
	{
		id: 8,
		name: "Herlina +",
		category: "Capsule",
		price: 299,
		originalPrice: 399,
		size: "60 capsules",
		description:
			"Helps improve health and supports complete immunity growth.",
		notes: {
			top: ["Rama Tulsi", "Shyama Tulsi"],
			heart: ["Van Tulsi", "Arjak Tulsi"],
			base: ["Ginger Oil", "Menthol Spark"],
		},
		tags: ["Drop", "Immunity", "Vitality"],
		rating: 4.5,
		reviews: 42,
		bg: "#fcfbfa",
		accent: "#114232",
		textColor: "#111111",
		subColor: "#666666",
		images: ["/assets/img/p-2.jpeg"],
	},
];

const toSlug = (value) =>
	String(value)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

export const seed = async () => {
	await connectDB();

	console.log("Cleaning database products and categories...");
	await Product.deleteMany({});
	await Category.deleteMany({});

	console.log("Seeding Veadya categories...");
	const categoryMap = {};
	for (const cat of categories) {
		const slug = toSlug(cat.name);
		const seededCategory = await Category.create({
			name: cat.name,
			slug,
			description: cat.description,
			isFeatured: cat.isFeatured,
			status: "active",
		});
		categoryMap[cat.name] = seededCategory._id;
		console.log(`Category seeded: ${cat.name}`);
	}

	console.log("Seeding Veadya products...");
	for (const product of products) {
		const slug = toSlug(product.name);
		const images = product.images.map((img) => ({ url: img }));

		await Product.create({
			title: product.name,
			slug,
			description: product.description,
			price: product.price,
			originalPrice: product.originalPrice,
			stock: 100,
			sku: `VEADYA-${product.id}`,
			category: categoryMap[product.category],
			categoryName: product.category,
			images,
			size: product.size,
			notes: product.notes,
			tags: product.tags,
			bg: product.bg,
			accent: product.accent,
			textColor: product.textColor,
			subColor: product.subColor,
			ratingAverage: product.rating,
			ratingCount: product.reviews,
			status: "active",
		});
		console.log(`Product seeded: ${product.name}`);
	}

	console.log("Seeding completed successfully!");
	await mongoose.disconnect();
};

// Check if run directly from command line
if (
	import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, "/") ||
	(process.argv[1] && process.argv[1].endsWith("seedProducts.js"))
) {
	seed().catch(async (error) => {
		console.error(error);
		try {
			await mongoose.disconnect();
		} catch (e) {}
		process.exit(1);
	});
}
