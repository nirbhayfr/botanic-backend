import sanitize from "mongo-sanitize";

import Banner from "../models/Banner.js";

import tryCatch from "../middlewares/errorHandler.js";

import { bannerSchema } from "../config/zod.js";

export const createBanner = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

	const validation = bannerSchema.safeParse(sanitizedBody);

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

	const banner = await Banner.create(validation.data);

	res.status(201).json({
		message: "Banner created successfully",
		data: banner,
	});
});

export const getBanners = tryCatch(async (req, res) => {
	const banners = await Banner.find().sort({
		order: 1,
		createdAt: -1,
	});

	res.status(200).json({
		message: "Banners fetched successfully",
		count: banners.length,
		data: banners,
	});
});

export const getSingleBanner = tryCatch(async (req, res) => {
	const { id } = req.params;

	const banner = await Banner.findById(id);

	if (!banner) {
		return res.status(404).json({
			message: "Banner not found",
		});
	}

	res.status(200).json({
		message: "Banner fetched successfully",
		data: banner,
	});
});

export const updateBanner = tryCatch(async (req, res) => {
	const { id } = req.params;

	const sanitizedBody = sanitize(req.body);

	const validation = bannerSchema.partial().safeParse(sanitizedBody);

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

	const existingBanner = await Banner.findById(id);

	if (!existingBanner) {
		return res.status(404).json({
			message: "Banner not found",
		});
	}

	const updatedBanner = await Banner.findByIdAndUpdate(id, validation.data, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		message: "Banner updated successfully",
		data: updatedBanner,
	});
});

export const deleteBanner = tryCatch(async (req, res) => {
	const { id } = req.params;

	const banner = await Banner.findById(id);

	if (!banner) {
		return res.status(404).json({
			message: "Banner not found",
		});
	}

	await Banner.findByIdAndDelete(id);

	res.status(200).json({
		message: "Banner deleted successfully",
	});
});

export const getBannersByPosition = tryCatch(async (req, res) => {
	const { position } = req.params;

	const banners = await Banner.find({
		position,
		status: "active",
	}).sort({
		order: 1,
	});

	res.status(200).json({
		message: "Banners fetched successfully",
		count: banners.length,
		data: banners,
	});
});

