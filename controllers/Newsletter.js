import sanitize from "mongo-sanitize";

import Newsletter from "../models/Newsletter.js";

import tryCatch from "../middlewares/errorHandler.js";

import { newsletterSchema } from "../config/zod.js";
import { sendEmail } from "../services/emailServices.js";

export const createNewsletter = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

	const validation = newsletterSchema.safeParse(sanitizedBody);

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

	const { email } = validation.data;

	const existingSubscriber = await Newsletter.findOne({
		email,
	});

	if (existingSubscriber) {
		return res.status(400).json({
			message: "Email is already subscribed",
		});
	}

	const subscriber = await Newsletter.create(validation.data);

	const emailResult = await sendEmail({
		to: subscriber.email,
		subject: "Welcome to our Newsletter",
		html: `
		<h2>Welcome!</h2>
		<p>Thank you for subscribing.</p>
	`,
	});

	res.status(201).json({
		message: "Subscribed successfully",
		data: subscriber,
		emailSent: !emailResult.skipped,
	});
});

export const getNewsletters = tryCatch(async (req, res) => {
	const subscribers = await Newsletter.find().sort({
		createdAt: -1,
	});

	res.status(200).json({
		message: "Subscribers fetched successfully",
		count: subscribers.length,
		data: subscribers,
	});
});

export const getSingleNewsletter = tryCatch(async (req, res) => {
	const { id } = req.params;

	const subscriber = await Newsletter.findById(id);

	if (!subscriber) {
		return res.status(404).json({
			message: "Subscriber not found",
		});
	}

	res.status(200).json({
		message: "Subscriber fetched successfully",
		data: subscriber,
	});
});

export const updateNewsletter = tryCatch(async (req, res) => {
	const { id } = req.params;

	const sanitizedBody = sanitize(req.body);

	const validation = newsletterSchema.partial().safeParse(sanitizedBody);

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

	const existingSubscriber = await Newsletter.findById(id);

	if (!existingSubscriber) {
		return res.status(404).json({
			message: "Subscriber not found",
		});
	}

	if (validation.data.email) {
		const existingEmail = await Newsletter.findOne({
			email: validation.data.email,
			_id: { $ne: id },
		});

		if (existingEmail) {
			return res.status(400).json({
				message: "Email already exists",
			});
		}
	}

	const updatedSubscriber = await Newsletter.findByIdAndUpdate(
		id,
		validation.data,
		{
			new: true,
			runValidators: true,
		},
	);

	res.status(200).json({
		message: "Subscriber updated successfully",
		data: updatedSubscriber,
	});
});

export const unsubscribeNewsletter = tryCatch(async (req, res) => {
	const { email } = req.params;

	const subscriber = await Newsletter.findOne({
		email,
	});

	if (!subscriber) {
		return res.status(404).json({
			message: "Subscriber not found",
		});
	}

	subscriber.status = "unsubscribed";

	await subscriber.save();

	res.status(200).json({
		message: "Unsubscribed successfully",
	});
});

export const deleteNewsletter = tryCatch(async (req, res) => {
	const { id } = req.params;

	const subscriber = await Newsletter.findById(id);

	if (!subscriber) {
		return res.status(404).json({
			message: "Subscriber not found",
		});
	}

	await Newsletter.findByIdAndDelete(id);

	res.status(200).json({
		message: "Subscriber deleted successfully",
	});
});
