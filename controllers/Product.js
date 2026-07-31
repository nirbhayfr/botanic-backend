import sanitize from "mongo-sanitize";
import mongoose from "mongoose";

import Product from "../models/Product.js";
import Category from "../models/Category.js";

import tryCatch from "../middlewares/errorHandler.js";

import { productSchema, productUpdateSchema } from "../config/zod.js";

const normalizeProductPayload = (data) => {
	const payload = { ...data };
	const rawSlug = data.slug || data.id || data.title || data.name;

	payload.title = data.title || data.name;
	payload.slug = String(rawSlug)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

	if (data.originalPrice) {
		payload.originalPrice = data.originalPrice;
	}

	if (data.rating !== undefined) {
		payload.ratingAverage = data.rating;
	}

	if (data.reviews !== undefined) {
		payload.ratingCount = data.reviews;
	}

	const images = data.images?.length ? data.images : data.image ? [data.image] : [];
	if (images.length) {
		payload.images = images.map((image) =>
			typeof image === "string" ? { url: image } : image,
		);
	}

	delete payload.id;
	delete payload.name;
	delete payload.image;
	delete payload.rating;
	delete payload.reviews;

	if (data.category && mongoose.Types.ObjectId.isValid(data.category)) {
		payload.category = data.category;
	} else {
		payload.categoryName = data.categoryName || data.category;
		delete payload.category;
	}

	return payload;
};

export const createProduct = tryCatch(async (req, res) => {
	const sanitizedBody = normalizeProductPayload(sanitize(req.body));

	const validation = productSchema.safeParse(sanitizedBody);

	if (!validation.success) {
		const zodError = validation.error;

		let firstErrorMessage = "Validation failed";

		if (zodError?.issues?.length) {
			firstErrorMessage = zodError.issues[0].message;
		}

		return res.status(400).json({
			message: firstErrorMessage,
		});
	}

	const payload = normalizeProductPayload(validation.data);

	const duplicateChecks = [{ slug: payload.slug }];

	if (payload.sku) {
		duplicateChecks.push({ sku: payload.sku });
	}

	const existingProduct = await Product.findOne({ $or: duplicateChecks });

	if (existingProduct) {
		return res.status(400).json({
			message: "Product already exists",
		});
	}

	const product = await Product.create(payload);

	res.status(201).json({
		message: "Product created successfully",
		data: product,
	});
});

export const getProducts = tryCatch(async (req, res) => {
	const {
		page = 1,
		limit = 10,
		search,
		category,
		sort,
		minPrice,
		maxPrice,
		status,
		stock,
	} = req.query;

	const query = {};

	if (search) {
		query.$or = [
			{
				title: {
					$regex: search,
					$options: "i",
				},
			},
			{
				description: {
					$regex: search,
					$options: "i",
				},
			},
		];
	}

	if (category) {
		if (mongoose.Types.ObjectId.isValid(category)) {
			query.category = category;
		} else {
			query.categoryName = category;
		}
	}

	if (status === "active") {
		const activeCategories = await Category.find({ status: { $ne: "inactive" } });
		const activeCategoryIds = activeCategories.map((c) => c._id);
		query.$and = [
			{ status: "active" },
			{
				$or: [
					{ category: { $in: activeCategoryIds } },
					{ category: { $exists: false } },
					{ category: null },
				],
			},
		];
	} else if (status) {
		query.status = status;
	}

	if (stock) {
		if (stock === "out") {
			query.stock = 0;
		} else if (stock === "low") {
			query.stock = { $gt: 0, $lte: 5 };
		} else if (stock === "in") {
			query.stock = { $gt: 0 };
		}
	}

	if (minPrice || maxPrice) {
		query.price = {};

		if (minPrice) {
			query.price.$gte = Number(minPrice);
		}

		if (maxPrice) {
			query.price.$lte = Number(maxPrice);
		}
	}

	let sortOption = { createdAt: -1 };

	if (sort === "price_asc") {
		sortOption = { price: 1 };
	}

	if (sort === "price_desc") {
		sortOption = { price: -1 };
	}

	if (sort === "newest") {
		sortOption = { createdAt: -1 };
	}

	if (sort === "oldest") {
		sortOption = { createdAt: 1 };
	}

	const skip = (Number(page) - 1) * Number(limit);

	const products = await Product.find(query)
		.populate("category")
		.sort(sortOption)
		.skip(skip)
		.limit(Number(limit));

	const totalProducts = await Product.countDocuments(query);

	res.status(200).json({
		message: "Products fetched successfully",

		currentPage: Number(page),

		totalPages: Math.ceil(totalProducts / Number(limit)),

		totalProducts,

		count: products.length,

		data: products,
	});
});

export const getSingleProduct = tryCatch(async (req, res) => {
	const { id } = req.params;

	const lookup = mongoose.Types.ObjectId.isValid(id)
		? { _id: id }
		: { slug: id };

	const product = await Product.findOne(lookup).populate("category");

	if (!product) {
		return res.status(404).json({
			message: "Product not found",
		});
	}

	res.status(200).json({
		message: "Product fetched successfully",
		data: product,
	});
});

export const updateProduct = tryCatch(async (req, res) => {
	const { id } = req.params;

	const sanitizedBody = normalizeProductPayload(sanitize(req.body));

	const validation = productUpdateSchema.safeParse(sanitizedBody);

	if (!validation.success) {
		const zodError = validation.error;

		let firstErrorMessage = "Validation failed";

		if (zodError?.issues?.length) {
			firstErrorMessage = zodError.issues[0].message;
		}

		return res.status(400).json({
			message: firstErrorMessage,
		});
	}

	const existingProduct = await Product.findById(id);

	if (!existingProduct) {
		return res.status(404).json({
			message: "Product not found",
		});
	}

	if (validation.data.slug) {
		const existingSlug = await Product.findOne({
			slug: validation.data.slug,
			_id: { $ne: id },
		});

		if (existingSlug) {
			return res.status(400).json({
				message: "Slug already exists",
			});
		}
	}

	if (validation.data.sku) {
		const existingSku = await Product.findOne({
			sku: validation.data.sku,
			_id: { $ne: id },
		});

		if (existingSku) {
			return res.status(400).json({
				message: "SKU already exists",
			});
		}
	}

	const updatedProduct = await Product.findByIdAndUpdate(
		id,
		normalizeProductPayload(validation.data),
		{
			new: true,
			runValidators: true,
		},
	).populate("category");

	res.status(200).json({
		message: "Product updated successfully",
		data: updatedProduct,
	});
});

export const deleteProduct = tryCatch(async (req, res) => {
	const { id } = req.params;

	const deletedProduct = await Product.findByIdAndDelete(id);

	if (!deletedProduct) {
		return res.status(404).json({
			message: "Product not found",
		});
	}

	res.status(200).json({
		message: "Product deleted successfully",
	});
});

export const seedProducts = tryCatch(async (req, res) => {
	const defaultCategories = [
		{ name: "Capsule", description: "Ayurvedic capsules formulated with pure herb extracts.", isFeatured: true },
		{ name: "Juice", description: "Fresh botanical juices crafted for daily wellness.", isFeatured: true },
		{ name: "Drop", description: "Concentrated herbal drops for instant healing.", isFeatured: true },
	];

	const defaultProducts = [
		{
			id: 1,
			name: "Sensex+",
			category: "Capsule",
			price: 499,
			originalPrice: 649,
			size: "60 Capsules",
			description: "Supports stamina, vitality, strength, and daily performance naturally.",
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
			images: ["/p-1.png"],
		},
		{
			id: 2,
			name: "Bowlease+",
			category: "Capsule",
			price: 549,
			originalPrice: 699,
			size: "60 Capsules",
			description: "Helps improve bowel movement and supports complete digestive comfort.",
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
			images: ["/p-2.png"],
		},
		{
			id: 3,
			name: "Calmiva+",
			category: "Capsule",
			price: 599,
			originalPrice: 799,
			size: "60 Capsules",
			description: "Promotes relaxation, better sleep quality, and emotional balance.",
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
			images: ["/p-3.png"],
		},
		{
			id: 4,
			name: "Livo De+ Juice",
			category: "Juice",
			price: 689,
			originalPrice: 899,
			size: "500ml",
			description: "Supports liver detoxification and improves overall metabolic health.",
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
			images: ["/p-4.png"],
		},
		{
			id: 5,
			name: "IBGS+ Juice",
			category: "Juice",
			price: 729,
			originalPrice: 949,
			size: "500ml",
			description: "Enhances digestion, gut balance, and nutrient absorption naturally.",
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
			images: ["/p-5.png"],
		},
		{
			id: 6,
			name: "Cardeva HRT+",
			category: "Capsule",
			price: 649,
			originalPrice: 849,
			size: "60 Capsules",
			description: "Supports healthy circulation and strengthens cardiovascular function.",
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
			images: ["/p-6.png"],
		},
		{
			id: 7,
			name: "Gluvora DB+",
			category: "Juice",
			price: 799,
			originalPrice: 1099,
			size: "500ml",
			description: "Helps maintain healthy sugar levels and supports metabolic wellness.",
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
			images: ["/p-7.png"],
		},
		{
			id: 8,
			name: "Swaras Drops",
			category: "Drop",
			price: 299,
			originalPrice: 399,
			size: "30ml",
			description: "Concentrated herbal drops for immunity boost and instant vitality.",
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
			images: ["/p-1.png"],
		}
	];

	const toSlug = (val) =>
		String(val)
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");

	await Product.deleteMany({});
	await Category.deleteMany({});

	const categoryMap = {};
	for (const cat of defaultCategories) {
		const slug = toSlug(cat.name);
		const seededCategory = await Category.create({
			name: cat.name,
			slug,
			description: cat.description,
			isFeatured: cat.isFeatured,
			status: "active",
		});
		categoryMap[cat.name] = seededCategory._id;
	}

	for (const product of defaultProducts) {
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
	}

	res.status(200).json({
		message: "Database seeded successfully",
	});
});
