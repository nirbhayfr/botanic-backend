import sanitize from "mongo-sanitize";

import ContentType from "../models/ContentType.js";

import tryCatch from "../middlewares/errorHandler.js";

import { contentTypeSchema } from "../config/zod.js";

export const createContentType = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

	const validation = contentTypeSchema.safeParse(sanitizedBody);

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

	const { name, slug } = validation.data;

	const existingContentType = await ContentType.findOne({
		$or: [{ name }, { slug }],
	});

	if (existingContentType) {
		return res.status(400).json({
			message: "Content type already exists",
		});
	}

	const contentType = await ContentType.create(validation.data);

	res.status(201).json({
		message: "Content type created successfully",
		data: contentType,
	});
});

export const getContentTypes = tryCatch(async (req, res) => {
	const contentTypes = await ContentType.find().sort({
		createdAt: -1,
	});

	res.status(200).json({
		message: "Content types fetched successfully",
		count: contentTypes.length,
		data: contentTypes,
	});
});

export const getSingleContentType = tryCatch(async (req, res) => {
	const { id } = req.params;

	const contentType = await ContentType.findById(id);

	if (!contentType) {
		return res.status(404).json({
			message: "Content type not found",
		});
	}

	res.status(200).json({
		message: "Content type fetched successfully",
		data: contentType,
	});
});

export const updateContentType = tryCatch(async (req, res) => {
	const { id } = req.params;

	const sanitizedBody = sanitize(req.body);

	const validation = contentTypeSchema.partial().safeParse(sanitizedBody);

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

	const existingContentType = await ContentType.findById(id);

	if (!existingContentType) {
		return res.status(404).json({
			message: "Content type not found",
		});
	}

	if (validation.data.name) {
		const existingName = await ContentType.findOne({
			name: validation.data.name,
			_id: { $ne: id },
		});

		if (existingName) {
			return res.status(400).json({
				message: "Content type name already exists",
			});
		}
	}

	if (validation.data.slug) {
		const existingSlug = await ContentType.findOne({
			slug: validation.data.slug,
			_id: { $ne: id },
		});

		if (existingSlug) {
			return res.status(400).json({
				message: "Content type slug already exists",
			});
		}
	}

	const updatedContentType = await ContentType.findByIdAndUpdate(
		id,
		validation.data,
		{
			new: true,
			runValidators: true,
		},
	);

	res.status(200).json({
		message: "Content type updated successfully",
		data: updatedContentType,
	});
});

export const deleteContentType = tryCatch(async (req, res) => {
	const { id } = req.params;

	const contentType = await ContentType.findById(id);

	if (!contentType) {
		return res.status(404).json({
			message: "Content type not found",
		});
	}

	await ContentType.findByIdAndDelete(id);

	res.status(200).json({
		message: "Content type deleted successfully",
	});
});

