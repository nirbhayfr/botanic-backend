import sanitize from "mongo-sanitize";

import Settings from "../models/Settings.js";

import tryCatch from "../middlewares/errorHandler.js";

import { settingsSchema } from "../config/zod.js";

export const getSettings = tryCatch(async (req, res) => {
	let settings = await Settings.findOne();

	if (!settings) {
		settings = await Settings.create({});
	}

	res.status(200).json({
		message: "Settings fetched successfully",
		data: settings,
	});
});

export const updateSettings = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

	const validation = settingsSchema.safeParse(sanitizedBody);

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

	let settings = await Settings.findOne();

	if (!settings) {
		settings = await Settings.create(validation.data);
	} else {
		settings = await Settings.findByIdAndUpdate(
			settings._id,
			validation.data,
			{
				new: true,
				runValidators: true,
			},
		);
	}

	res.status(200).json({
		message: "Settings updated successfully",
		data: settings,
	});
});

