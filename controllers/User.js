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
		name,
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
	const fallbackNameParts = name?.trim().split(/\s+/) || [];
	const resolvedFirstName = firstName || fallbackNameParts[0];
	const resolvedLastName =
		lastName || fallbackNameParts.slice(1).join(" ") || undefined;

	const userData = {
		email,
		firstName: resolvedFirstName,
		lastName: resolvedLastName,
		password: hashedPassword,
		role,
	};

	if (phone) {
		userData.phone = phone;
	}

	const newUser = await User.create(userData);

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
		return res.status(400).json({
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

export const getAddress = tryCatch(async (req, res) => {
	const userId = req?.userId;

	if (!userId) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	const user = await User.findById(userId).select("shippingAddress phone");

	if (!user) {
		return res.status(404).json({
			message: "User not found",
		});
	}

	res.status(200).json({
		message: "Address fetched successfully",
		data: {
			shippingAddress: user.shippingAddress || null,
			phone: user.phone || null,
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

	const addressData = {
		addressLine1: validation.data.addressLine1 || validation.data.line1,
		addressLine2: validation.data.addressLine2 || validation.data.line2,
		city: validation.data.city,
		state: validation.data.state,
		pinCode: (validation.data.pinCode || validation.data.pincode || "").replace(
			/\D/g,
			"",
		),
		country: validation.data.country || "India",
	};

	const updatePayload = { shippingAddress: addressData };

	if (validation.data.phone) {
		updatePayload.phone = validation.data.phone.replace(/\D/g, "");
	}

	const updatedUser = await User.findByIdAndUpdate(
		userId,
		updatePayload,
		{ new: true, runValidators: true },
	);

	if (!updatedUser) {
		return res.status(404).json({
			message: "User not found",
		});
	}

	res.status(200).json({
		message: "Address updated successfully",
		data: {
			shippingAddress: updatedUser.shippingAddress,
			phone: updatedUser.phone || null,
		},
	});
});

export const getAllUsers = tryCatch(async (req, res) => {
	const users = await User.find().sort({ createdAt: -1 });

	res.status(200).json({
		message: "Users fetched successfully",
		count: users.length,
		data: users,
	});
});

export const updateUser = tryCatch(async (req, res) => {
	const { id } = req.params;
	const sanitizedBody = sanitize(req.body);

	const updatedUser = await User.findByIdAndUpdate(
		id,
		sanitizedBody,
		{ new: true, runValidators: true }
	);

	if (!updatedUser) {
		return res.status(404).json({
			message: "User not found",
		});
	}

	res.status(200).json({
		message: "User updated successfully",
		data: updatedUser,
	});
});

export const deleteUser = tryCatch(async (req, res) => {
	const { id } = req.params;

	const deletedUser = await User.findByIdAndDelete(id);

	if (!deletedUser) {
		return res.status(404).json({
			message: "User not found",
		});
	}

	res.status(200).json({
		message: "User deleted successfully",
	});
});

export const getMe = tryCatch(async (req, res) => {
	const userId = req.userId;

	if (!userId) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	const user = await User.findById(userId);

	if (!user) {
		return res.status(404).json({
			message: "User not found",
		});
	}

	res.status(200).json({
		message: "Profile fetched successfully",
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

