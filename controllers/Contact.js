import sanitize from "mongo-sanitize";

import Contact from "../models/Contact.js";
import tryCatch from "../middlewares/errorHandler.js";
import { contactSchema } from "../config/zod.js";

// Submit a contact message (Public)
export const createContactMessage = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

	const validation = contactSchema.safeParse(sanitizedBody);

	if (!validation.success) {
		return res.status(400).json({
			message: validation.error.issues[0].message,
		});
	}

	const { name, email, subject, message } = validation.data;

	const newContact = await Contact.create({
		name,
		email,
		subject,
		message,
	});

	res.status(201).json({
		message: "Message submitted successfully",
		data: newContact,
	});
});

// Get all contact messages (Admin only)
export const getAllContactMessages = tryCatch(async (req, res) => {
	const messages = await Contact.find().sort({ createdAt: -1 });

	res.status(200).json({
		count: messages.length,
		data: messages,
	});
});

// Delete a contact message (Admin only)
export const deleteContactMessage = tryCatch(async (req, res) => {
	const { id } = req.params;

	const message = await Contact.findByIdAndDelete(id);

	if (!message) {
		return res.status(404).json({
			message: "Message not found",
		});
	}

	res.status(200).json({
		message: "Message deleted successfully",
	});
});
