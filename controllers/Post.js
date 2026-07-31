import sanitize from "mongo-sanitize";

import Post from "../models/Post.js";

import tryCatch from "../middlewares/errorHandler.js";

import { postSchema } from "../config/zod.js";

export const createPost = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

	const validation = postSchema.safeParse(sanitizedBody);

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

	const { title, slug } = validation.data;

	const existingPost = await Post.findOne({
		$or: [{ title }, { slug }],
	});

	if (existingPost) {
		return res.status(400).json({
			message: "Post already exists",
		});
	}

	const post = await Post.create(validation.data);

	res.status(201).json({
		message: "Post created successfully",
		data: post,
	});
});

export const getPosts = tryCatch(async (req, res) => {
	const posts = await Post.find()
		.populate("postCategory")
		.populate("author", "firstName lastName email")
		.sort({ createdAt: -1 });

	res.status(200).json({
		message: "Posts fetched successfully",
		count: posts.length,
		data: posts,
	});
});

export const getSinglePost = tryCatch(async (req, res) => {
	const { id } = req.params;

	const post = await Post.findById(id)
		.populate("postCategory")
		.populate("author", "firstName lastName email");

	if (!post) {
		return res.status(404).json({
			message: "Post not found",
		});
	}

	res.status(200).json({
		message: "Post fetched successfully",
		data: post,
	});
});

export const getPostBySlug = tryCatch(async (req, res) => {
	const { slug } = req.params;

	const post = await Post.findOne({
		slug,
		status: "published",
	})
		.populate("postCategory")
		.populate("author", "firstName lastName email");

	if (!post) {
		return res.status(404).json({
			message: "Post not found",
		});
	}

	res.status(200).json({
		message: "Post fetched successfully",
		data: post,
	});
});

export const updatePost = tryCatch(async (req, res) => {
	const { id } = req.params;

	const sanitizedBody = sanitize(req.body);

	const validation = postSchema.partial().safeParse(sanitizedBody);

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

	const existingPost = await Post.findById(id);

	if (!existingPost) {
		return res.status(404).json({
			message: "Post not found",
		});
	}

	if (validation.data.title) {
		const existingTitle = await Post.findOne({
			title: validation.data.title,
			_id: { $ne: id },
		});

		if (existingTitle) {
			return res.status(400).json({
				message: "Post title already exists",
			});
		}
	}

	if (validation.data.slug) {
		const existingSlug = await Post.findOne({
			slug: validation.data.slug,
			_id: { $ne: id },
		});

		if (existingSlug) {
			return res.status(400).json({
				message: "Post slug already exists",
			});
		}
	}

	const updatedPost = await Post.findByIdAndUpdate(id, validation.data, {
		new: true,
		runValidators: true,
	})
		.populate("postCategory")
		.populate("author", "firstName lastName email");

	res.status(200).json({
		message: "Post updated successfully",
		data: updatedPost,
	});
});

export const deletePost = tryCatch(async (req, res) => {
	const { id } = req.params;

	const post = await Post.findById(id);

	if (!post) {
		return res.status(404).json({
			message: "Post not found",
		});
	}

	await Post.findByIdAndDelete(id);

	res.status(200).json({
		message: "Post deleted successfully",
	});
});

