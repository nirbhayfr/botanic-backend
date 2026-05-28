import sanitize from "mongo-sanitize";
import Consultation from "../models/Consultation.js";
import tryCatch from "../middlewares/errorHandler.js";
import { consultationSchema } from "../config/zod.js";

export const createConsultation = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);
	const validation = consultationSchema.safeParse(sanitizedBody);

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

	const { name, email, goal, notes } = validation.data;

	// Optional link to logged-in user if token is validated
	const userId = req.userId;

	const consultation = await Consultation.create({
		name,
		email,
		goal,
		notes,
		user: userId || undefined,
	});

	res.status(201).json({
		message: "Consultation submitted successfully",
		data: consultation,
	});
});

export const getMyConsultations = tryCatch(async (req, res) => {
	const userId = req.userId;

	if (!userId) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	const consultations = await Consultation.find({ user: userId }).sort({
		createdAt: -1,
	});

	res.status(200).json({
		count: consultations.length,
		data: consultations,
	});
});

export const getAllConsultations = tryCatch(async (req, res) => {
	const { page = 1, limit = 10, search = "" } = req.query;

	const query = search
		? {
				$or: [
					{ name: { $regex: search, $options: "i" } },
					{ email: { $regex: search, $options: "i" } },
					{ goal: { $regex: search, $options: "i" } },
				],
		  }
		: {};

	const total = await Consultation.countDocuments(query);
	const consultations = await Consultation.find(query)
		.populate("user", "firstName lastName email")
		.sort({ createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(Number(limit));

	res.status(200).json({
		count: consultations.length,
		totalConsultations: total,
		totalPages: Math.ceil(total / limit),
		data: consultations,
	});
});

export const deleteConsultation = tryCatch(async (req, res) => {
	const { id } = req.params;

	const consultation = await Consultation.findById(id);

	if (!consultation) {
		return res.status(404).json({
			message: "Consultation not found",
		});
	}

	await Consultation.findByIdAndDelete(id);

	res.status(200).json({
		message: "Consultation deleted successfully",
	});
});
