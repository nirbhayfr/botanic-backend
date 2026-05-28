import sanitize from "mongo-sanitize";

import Review from "../models/Review.js";
import Product from "../models/Product.js";

import tryCatch from "../middlewares/errorHandler.js";

import { reviewSchema } from "../config/zod.js";

const updateProductRatings = async (productId) => {
	const reviews = await Review.find({
		product: productId,
	});

	const ratingCount = reviews.length;

	if (ratingCount === 0) {
		await Product.findByIdAndUpdate(productId, {
			ratingAverage: 0,
			ratingCount: 0,
		});

		return;
	}

	const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);

	const ratingAverage = totalRating / ratingCount;

	await Product.findByIdAndUpdate(productId, {
		ratingAverage: Number(ratingAverage.toFixed(1)),
		ratingCount,
	});
};

export const createReview = tryCatch(async (req, res) => {
	const userId = req.userId;

	if (!userId) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	const sanitizedBody = sanitize(req.body);

	const validation = reviewSchema.safeParse(sanitizedBody);

	if (!validation.success) {
		return res.status(400).json({
			message: validation.error.issues[0].message,
		});
	}

	const { product, rating, comment } = validation.data;

	const existingProduct = await Product.findById(product);

	if (!existingProduct) {
		return res.status(404).json({
			message: "Product not found",
		});
	}

	const existingReview = await Review.findOne({
		user: userId,
		product,
	});

	if (existingReview) {
		return res.status(400).json({
			message: "You have already reviewed this product",
		});
	}

	const review = await Review.create({
		user: userId,
		product,
		rating,
		comment,
	});

	await updateProductRatings(product);

	res.status(201).json({
		message: "Review added successfully",
		data: review,
	});
});

export const getProductReviews = tryCatch(async (req, res) => {
	const { productId } = req.params;

	const reviews = await Review.find({
		product: productId,
	})
		.populate("user", "firstName lastName")
		.sort({
			createdAt: -1,
		});

	res.status(200).json({
		count: reviews.length,
		data: reviews,
	});
});

export const updateReview = tryCatch(async (req, res) => {
	const userId = req.userId;

	const { id } = req.params;

	const sanitizedBody = sanitize(req.body);

	const validation = reviewSchema.partial().safeParse(sanitizedBody);

	if (!validation.success) {
		return res.status(400).json({
			message: validation.error.issues[0].message,
		});
	}

	const review = await Review.findOne({
		_id: id,
		user: userId,
	});

	if (!review) {
		return res.status(404).json({
			message: "Review not found",
		});
	}

	if (validation.data.rating !== undefined) {
		review.rating = validation.data.rating;
	}

	if (validation.data.comment !== undefined) {
		review.comment = validation.data.comment;
	}

	await review.save();

	await updateProductRatings(review.product);

	res.status(200).json({
		message: "Review updated successfully",
		data: review,
	});
});

export const deleteReview = tryCatch(async (req, res) => {
	const userId = req.userId;

	const { id } = req.params;

	const review = await Review.findOne({
		_id: id,
		user: userId,
	});

	if (!review) {
		return res.status(404).json({
			message: "Review not found",
		});
	}

	const productId = review.product;

	await review.deleteOne();

	await updateProductRatings(productId);

	res.status(200).json({
		message: "Review deleted successfully",
	});
});
