import sanitize from "mongo-sanitize";

import Category from "../models/Category.js";
import Product from "../models/Product.js";

import tryCatch from "../middlewares/errorHandler.js";

import { categorySchema } from "../config/zod.js";

export const createCategory = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

	const validation = categorySchema.safeParse(sanitizedBody);

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
		name,
		slug,
		description,
		image,
		parentCategory,
		isFeatured,
		status,
	} = validation.data;

	const existingCategory = await Category.findOne({
		$or: [{ name }, { slug }],
	});

	if (existingCategory) {
		return res.status(400).json({
			message: "Category already exists",
		});
	}

	const category = await Category.create({
		name,
		slug,
		description,
		image,
		parentCategory,
		isFeatured,
		status,
	});

	res.status(201).json({
		message: "Category created successfully",
		data: category,
	});
});

export const getCategories = tryCatch(async (req, res) => {
	const categories = await Category.find()
		.populate("parentCategory")
		.sort({ createdAt: -1 });

	res.status(200).json({
		message: "Categories fetched successfully",
		count: categories.length,
		data: categories,
	});
});

export const getSingleCategory = tryCatch(async (req, res) => {
	const { id } = req.params;

	const category = await Category.findById(id).populate("parentCategory");

	if (!category) {
		return res.status(404).json({
			message: "Category not found",
		});
	}

	res.status(200).json({
		message: "Category fetched successfully",
		data: category,
	});
});

export const updateCategory = tryCatch(async (req, res) => {
	const { id } = req.params;

	const sanitizedBody = sanitize(req.body);

	const validation = categorySchema.partial().safeParse(sanitizedBody);

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

	const existingCategory = await Category.findById(id);

	if (!existingCategory) {
		return res.status(404).json({
			message: "Category not found",
		});
	}

	if (validation.data.name) {
		const existingName = await Category.findOne({
			name: validation.data.name,
			_id: { $ne: id },
		});

		if (existingName) {
			return res.status(400).json({
				message: "Category name already exists",
			});
		}
	}

	if (validation.data.slug) {
		const existingSlug = await Category.findOne({
			slug: validation.data.slug,
			_id: { $ne: id },
		});

		if (existingSlug) {
			return res.status(400).json({
				message: "Category slug already exists",
			});
		}
	}

	const updatedCategory = await Category.findByIdAndUpdate(
		id,
		validation.data,
		{
			new: true,
			runValidators: true,
		},
	).populate("parentCategory");

	res.status(200).json({
		message: "Category updated successfully",
		data: updatedCategory,
	});
});

export const deleteCategory = tryCatch(async (req, res) => {
	const { id } = req.params;

	const category = await Category.findById(id);

	if (!category) {
		return res.status(404).json({
			message: "Category not found",
		});
	}

	const productsUsingCategory = await Product.countDocuments({
		category: id,
	});

	if (productsUsingCategory > 0) {
		return res.status(400).json({
			message: "Cannot delete category because products are using it",
		});
	}

	await Category.findByIdAndDelete(id);

	res.status(200).json({
		message: "Category deleted successfully",
	});
});
