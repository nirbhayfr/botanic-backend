import sanitize from "mongo-sanitize";

import ContentEntry from "../models/ContentEntry.js";
import ContentType from "../models/ContentType.js";

import tryCatch from "../middlewares/errorHandler.js";

import { contentEntrySchema } from "../config/zod.js";

export const createContentEntry = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

	const validation = contentEntrySchema.safeParse(sanitizedBody);

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

	const { contentType } = validation.data;

	const existingContentType = await ContentType.findById(contentType);

	if (!existingContentType) {
		return res.status(404).json({
			message: "Content type not found",
		});
	}

	const contentEntry = await ContentEntry.create(validation.data);

	res.status(201).json({
		message: "Content entry created successfully",
		data: contentEntry,
	});
});

export const getContentEntries = tryCatch(async (req, res) => {
	const contentEntries = await ContentEntry.find()
		.populate("contentType")
		.sort({ createdAt: -1 });

	res.status(200).json({
		message: "Content entries fetched successfully",
		count: contentEntries.length,
		data: contentEntries,
	});
});

export const getSingleContentEntry = tryCatch(async (req, res) => {
	const { id } = req.params;

	const contentEntry =
		await ContentEntry.findById(id).populate("contentType");

	if (!contentEntry) {
		return res.status(404).json({
			message: "Content entry not found",
		});
	}

	res.status(200).json({
		message: "Content entry fetched successfully",
		data: contentEntry,
	});
});

export const updateContentEntry = tryCatch(async (req, res) => {
	const { id } = req.params;

	const sanitizedBody = sanitize(req.body);

	const validation = contentEntrySchema.partial().safeParse(sanitizedBody);

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

	const existingEntry = await ContentEntry.findById(id);

	if (!existingEntry) {
		return res.status(404).json({
			message: "Content entry not found",
		});
	}

	const updatedEntry = await ContentEntry.findByIdAndUpdate(
		id,
		validation.data,
		{
			new: true,
			runValidators: true,
		},
	).populate("contentType");

	res.status(200).json({
		message: "Content entry updated successfully",
		data: updatedEntry,
	});
});

export const deleteContentEntry = tryCatch(async (req, res) => {
	const { id } = req.params;

	const contentEntry = await ContentEntry.findById(id);

	if (!contentEntry) {
		return res.status(404).json({
			message: "Content entry not found",
		});
	}

	await ContentEntry.findByIdAndDelete(id);

	res.status(200).json({
		message: "Content entry deleted successfully",
	});
});

export const getContentEntriesByType = tryCatch(async (req, res) => {
	const { slug } = req.params;

	const contentType = await ContentType.findOne({
		slug,
	});

	if (!contentType) {
		return res.status(404).json({
			message: "Content type not found",
		});
	}

	const entries = await ContentEntry.find({
		contentType: contentType._id,
		status: "published",
	})
		.populate("contentType")
		.sort({
			createdAt: -1,
		});

	res.status(200).json({
		message: "Content entries fetched successfully",
		count: entries.length,
		data: entries,
	});
});

