import sanitize from "mongo-sanitize";
import mongoose from "mongoose";

import Product from "../models/Product.js";

import tryCatch from "../middlewares/errorHandler.js";

import { productSchema } from "../config/zod.js";

const normalizeProductPayload = (data) => {
	const payload = { ...data };

	if (data.category && mongoose.Types.ObjectId.isValid(data.category)) {
		payload.category = data.category;
	} else {
		payload.categoryName = data.categoryName || data.category;
		delete payload.category;
	}

	return payload;
};

export const createProduct = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

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

	const {
		title,
		slug,
		description,
		longDescription,
		price,
		salePrice,
		stock,
		sku,
		category,
		categoryName,
		concern,
		images,
		badge,
		priceLabel,
		tagline,
		quantity,
		dosage,
		ingredients,
		benefits,
		suitableFor,
		certifications,
		relatedIds,
		isFeatured,
		status,
	} = validation.data;

	const duplicateChecks = [{ slug }];

	if (sku) {
		duplicateChecks.push({ sku });
	}

	const existingProduct = await Product.findOne({ $or: duplicateChecks });

	if (existingProduct) {
		return res.status(400).json({
			message: "Product already exists",
		});
	}

	const product = await Product.create(normalizeProductPayload({
		title,
		slug,
		description,
		longDescription,
		price,
		salePrice,
		stock,
		sku,
		category,
		categoryName,
		concern,
		images,
		badge,
		priceLabel,
		tagline,
		quantity,
		dosage,
		ingredients,
		benefits,
		suitableFor,
		certifications,
		relatedIds,
		isFeatured,
		status,
	}));

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

	if (status) {
		query.status = status;
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

	const sanitizedBody = sanitize(req.body);

	const validation = productSchema.partial().safeParse(sanitizedBody);

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
