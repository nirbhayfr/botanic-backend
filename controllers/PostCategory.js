import sanitize from "mongo-sanitize";

import Post from "../models/Post.js";
import PostCategory from "../models/PostCategory.js";

import tryCatch from "../middlewares/errorHandler.js";

import { postCategorySchema } from "../config/zod.js";

export const createPostCategory = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

	const validation = postCategorySchema.safeParse(sanitizedBody);

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

	const { name, slug, description, status } = validation.data;

	const existingCategory = await PostCategory.findOne({
		$or: [{ name }, { slug }],
	});

	if (existingCategory) {
		return res.status(400).json({
			message: "Post category already exists",
		});
	}

	const postCategory = await PostCategory.create({
		name,
		slug,
		description,
		status,
	});

	res.status(201).json({
		message: "Post category created successfully",
		data: postCategory,
	});
});

export const getPostCategories = tryCatch(async (req, res) => {
	const categories = await PostCategory.find().sort({
		createdAt: -1,
	});

	res.status(200).json({
		message: "Post categories fetched successfully",
		count: categories.length,
		data: categories,
	});
});

export const getSinglePostCategory = tryCatch(async (req, res) => {
	const { id } = req.params;

	const category = await PostCategory.findById(id);

	if (!category) {
		return res.status(404).json({
			message: "Post category not found",
		});
	}

	res.status(200).json({
		message: "Post category fetched successfully",
		data: category,
	});
});

export const updatePostCategory = tryCatch(async (req, res) => {
	const { id } = req.params;

	const sanitizedBody = sanitize(req.body);

	const validation = postCategorySchema.partial().safeParse(sanitizedBody);

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

	const existingCategory = await PostCategory.findById(id);

	if (!existingCategory) {
		return res.status(404).json({
			message: "Post category not found",
		});
	}

	if (validation.data.name) {
		const existingName = await PostCategory.findOne({
			name: validation.data.name,
			_id: { $ne: id },
		});

		if (existingName) {
			return res.status(400).json({
				message: "Post category name already exists",
			});
		}
	}

	if (validation.data.slug) {
		const existingSlug = await PostCategory.findOne({
			slug: validation.data.slug,
			_id: { $ne: id },
		});

		if (existingSlug) {
			return res.status(400).json({
				message: "Post category slug already exists",
			});
		}
	}

	const updatedCategory = await PostCategory.findByIdAndUpdate(
		id,
		validation.data,
		{
			new: true,
			runValidators: true,
		},
	);

	res.status(200).json({
		message: "Post category updated successfully",
		data: updatedCategory,
	});
});

export const deletePostCategory = tryCatch(async (req, res) => {
	const { id } = req.params;

	const category = await PostCategory.findById(id);

	if (!category) {
		return res.status(404).json({
			message: "Post category not found",
		});
	}

	const postsUsingCategory = await Post.countDocuments({
		postCategory: id,
	});

	if (postsUsingCategory > 0) {
		return res.status(400).json({
			message: "Cannot delete category because posts are using it",
		});
	}

	await PostCategory.findByIdAndDelete(id);

	res.status(200).json({
		message: "Post category deleted successfully",
	});
});

