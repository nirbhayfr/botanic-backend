import sanitize from "mongo-sanitize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import tryCatch from "../middlewares/errorHandler.js";
import { addressSchema, loginSchema, registerSchema } from "../config/zod.js";

const generateToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || "7d",
	});
};

export const registerUser = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);
	const validation = registerSchema.safeParse(sanitizedBody);

	if (!validation.success) {
		const zodError = validation.error;

		let firstErrorMessage = "Validation failed";
		let allErrors = [];

		if (zodError?.issues && Array.isArray(zodError.issues)) {
			allErrors = zodError.issues.map((issue) => ({
				field: issue.path ? issue.path.join(".") : "unknown",
				message: issue.message || "Validation Error",
				code: issue.code,
			}));

			firstErrorMessage = allErrors[0]?.message || "Validation Error";
		}

		return res.status(400).json({
			message: firstErrorMessage,
		});
	}

	const {
		firstName,
		lastName,
		phone,
		email,
		password,
		confirmPassword,
		role,
	} = validation.data;

	const checkPassword = confirmPassword === password;
	if (!checkPassword) {
		return res.status(400).json({
			message: "Password and Confirm Password do not match",
		});
	}

	const existingUser = await User.findOne({ email });

	if (existingUser) {
		return res.status(400).json({
			message: "User already exists",
		});
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const newUser = await User.create({
		email,
		firstName,
		lastName,
		phone,
		password: hashedPassword,
		role,
	});

	res.status(201).json({
		message: "User has been created succesfully",
		data: {
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			email: newUser.email,
			role: newUser.role,
			shippingAddress: newUser.shippingAddress,
		},
	});
});

export const loginUser = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

	const validation = loginSchema.safeParse(sanitizedBody);

	if (!validation.success) {
		const zodError = validation.error;

		let firstErrorMessage = "Validation failed";
		let allErrors = [];

		if (zodError?.issues && Array.isArray(zodError.issues)) {
			allErrors = zodError.issues.map((issue) => ({
				field: issue.path ? issue.path.join(".") : "unknown",
				message: issue.message || "Validation Error",
				code: issue.code,
			}));

			firstErrorMessage = allErrors[0]?.message || "Validation Error";
		}

		return res.status(400).json({
			message: firstErrorMessage,
		});
	}

	const { email, password } = validation.data;

	const user = await User.findOne({ email }).select("+password");
	if (!user) {
		return res.status(400).json({
			message: "Invalid Credentials",
		});
	}

	const comparePassword = await bcrypt.compare(password, user.password);
	if (!comparePassword) {
		res.status(400).json({
			messsage: "Invalid Credentials",
		});
	}

	const token = generateToken(user._id);

	res.status(200).json({
		message: "Login successful",
		token,
		data: {
			_id: user._id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			phone: user.phone,
			shippingAddress: user.shippingAddress,
			role: user.role,
		},
	});
});

export const setAddress = tryCatch(async (req, res) => {
	const userId = req?.userId;

	if (!userId) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	const sanitizedBody = sanitize(req.body);

	const validation = addressSchema.safeParse(sanitizedBody);

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

	const addressData = validation.data;

	const updatedUser = await User.findByIdAndUpdate(
		userId,
		{ shippingAddress: addressData },
		{ new: true, runValidators: true },
	);

	if (!updatedUser) {
		return res.status(404).json({
			message: "User not found",
		});
	}

	res.status(200).json({
		message: "Address updated successfully",
		data: updatedUser.shippingAddress,
	});
});
