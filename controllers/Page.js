import sanitize from "mongo-sanitize";

import Page from "../models/Page.js";

import tryCatch from "../middlewares/errorHandler.js";

import { pageSchema } from "../config/zod.js";

export const createPage = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

	const validation = pageSchema.safeParse(sanitizedBody);

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

	const existingPage = await Page.findOne({
		$or: [{ title }, { slug }],
	});

	if (existingPage) {
		return res.status(400).json({
			message: "Page already exists",
		});
	}

	const page = await Page.create(validation.data);

	res.status(201).json({
		message: "Page created successfully",
		data: page,
	});
});

export const getPages = tryCatch(async (req, res) => {
	const pages = await Page.find().sort({ createdAt: -1 });

	res.status(200).json({
		message: "Pages fetched successfully",
		count: pages.length,
		data: pages,
	});
});

export const getSinglePage = tryCatch(async (req, res) => {
	const { id } = req.params;

	const page = await Page.findById(id);

	if (!page) {
		return res.status(404).json({
			message: "Page not found",
		});
	}

	res.status(200).json({
		message: "Page fetched successfully",
		data: page,
	});
});

export const updatePage = tryCatch(async (req, res) => {
	const { id } = req.params;

	const sanitizedBody = sanitize(req.body);

	const validation = pageSchema.partial().safeParse(sanitizedBody);

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

	const existingPage = await Page.findById(id);

	if (!existingPage) {
		return res.status(404).json({
			message: "Page not found",
		});
	}

	if (validation.data.title) {
		const existingTitle = await Page.findOne({
			title: validation.data.title,
			_id: { $ne: id },
		});

		if (existingTitle) {
			return res.status(400).json({
				message: "Page title already exists",
			});
		}
	}

	if (validation.data.slug) {
		const existingSlug = await Page.findOne({
			slug: validation.data.slug,
			_id: { $ne: id },
		});

		if (existingSlug) {
			return res.status(400).json({
				message: "Page slug already exists",
			});
		}
	}

	const updatedPage = await Page.findByIdAndUpdate(id, validation.data, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		message: "Page updated successfully",
		data: updatedPage,
	});
});

export const deletePage = tryCatch(async (req, res) => {
	const { id } = req.params;

	const page = await Page.findById(id);

	if (!page) {
		return res.status(404).json({
			message: "Page not found",
		});
	}

	await Page.findByIdAndDelete(id);

	res.status(200).json({
		message: "Page deleted successfully",
	});
});

export const getPageBySlug = tryCatch(async (req, res) => {
	const { slug } = req.params;

	const page = await Page.findOne({
		slug,
		status: "published",
	});

	if (!page) {
		return res.status(404).json({
			message: "Page not found",
		});
	}

	res.status(200).json({
		message: "Page fetched successfully",
		data: page,
	});
});

