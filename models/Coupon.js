import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: [true, "Coupon code is required"],
			trim: true,
			uppercase: true,
			unique: true,
		},

		description: {
			type: String,
		},

		type: {
			type: String,
			enum: ["percentage", "fixed"],
			required: [true, "Coupon type is required"],
		},

		value: {
			type: Number,
			required: [true, "Coupon value is required"],
			min: 0,
		},

		minOrderAmount: {
			type: Number,
			default: 0,
		},

		maxDiscount: {
			type: Number,
		},

		usageLimit: {
			type: Number,
		},

		usedCount: {
			type: Number,
			default: 0,
		},

		startDate: {
			type: Date,
		},

		expiryDate: {
			type: Date,
		},

		status: {
			type: String,
			enum: ["active", "inactive"],
			default: "active",
		},
	},
	{ timestamps: true },
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;

