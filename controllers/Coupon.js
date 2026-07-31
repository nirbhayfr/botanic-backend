import sanitize from "mongo-sanitize";

import Coupon from "../models/Coupon.js";

import tryCatch from "../middlewares/errorHandler.js";

import { couponSchema } from "../config/zod.js";

export const createCoupon = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

	const validation = couponSchema.safeParse(sanitizedBody);

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

	const existingCoupon = await Coupon.findOne({
		code: validation.data.code.toUpperCase(),
	});

	if (existingCoupon) {
		return res.status(400).json({
			message: "Coupon already exists",
		});
	}

	const coupon = await Coupon.create({
		...validation.data,
		code: validation.data.code.toUpperCase(),
	});

	res.status(201).json({
		message: "Coupon created successfully",
		data: coupon,
	});
});

export const getCoupons = tryCatch(async (req, res) => {
	const coupons = await Coupon.find().sort({
		createdAt: -1,
	});

	res.status(200).json({
		message: "Coupons fetched successfully",
		count: coupons.length,
		data: coupons,
	});
});

export const getSingleCoupon = tryCatch(async (req, res) => {
	const { id } = req.params;

	const coupon = await Coupon.findById(id);

	if (!coupon) {
		return res.status(404).json({
			message: "Coupon not found",
		});
	}

	res.status(200).json({
		message: "Coupon fetched successfully",
		data: coupon,
	});
});

export const updateCoupon = tryCatch(async (req, res) => {
	const { id } = req.params;

	const sanitizedBody = sanitize(req.body);

	const validation = couponSchema.partial().safeParse(sanitizedBody);

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

	const existingCoupon = await Coupon.findById(id);

	if (!existingCoupon) {
		return res.status(404).json({
			message: "Coupon not found",
		});
	}

	if (validation.data.code) {
		const existingCode = await Coupon.findOne({
			code: validation.data.code.toUpperCase(),
			_id: { $ne: id },
		});

		if (existingCode) {
			return res.status(400).json({
				message: "Coupon code already exists",
			});
		}
	}

	const updatedCoupon = await Coupon.findByIdAndUpdate(
		id,
		{
			...validation.data,
			...(validation.data.code && {
				code: validation.data.code.toUpperCase(),
			}),
		},
		{
			new: true,
			runValidators: true,
		},
	);

	res.status(200).json({
		message: "Coupon updated successfully",
		data: updatedCoupon,
	});
});

export const deleteCoupon = tryCatch(async (req, res) => {
	const { id } = req.params;

	const coupon = await Coupon.findById(id);

	if (!coupon) {
		return res.status(404).json({
			message: "Coupon not found",
		});
	}

	await Coupon.findByIdAndDelete(id);

	res.status(200).json({
		message: "Coupon deleted successfully",
	});
});

export const validateCoupon = tryCatch(async (req, res) => {
	const { code, amount } = req.body;

	const coupon = await Coupon.findOne({
		code: code.toUpperCase(),
		status: "active",
	});

	if (!coupon) {
		return res.status(400).json({
			message: "Invalid coupon",
		});
	}

	if (coupon.expiryDate && new Date() > coupon.expiryDate) {
		return res.status(400).json({
			message: "Coupon expired",
		});
	}

	if (amount < (coupon.minOrderAmount || 0)) {
		return res.status(400).json({
			message: "Minimum order amount not met",
		});
	}

	let discount = 0;

	if (coupon.type === "percentage") {
		discount = (amount * coupon.value) / 100;

		if (coupon.maxDiscount && discount > coupon.maxDiscount) {
			discount = coupon.maxDiscount;
		}
	} else {
		discount = coupon.value;
	}

	res.status(200).json({
		message: "Coupon applied",
		data: {
			discount,
			finalAmount: amount - discount,
		},
	});
});

