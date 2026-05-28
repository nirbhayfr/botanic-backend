import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},

		title: {
			type: String,
			required: true,
		},

		price: {
			type: Number,
			required: true,
		},

		quantity: {
			type: Number,
			required: true,
		},

		image: {
			type: String,
		},
	},
	{ _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
	{
		addressLine1: String,
		addressLine2: String,
		city: String,
		state: String,
		pinCode: String,
		country: String,
	},
	{ _id: false },
);

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		items: [orderItemSchema],

		shippingAddress: shippingAddressSchema,

		paymentMethod: {
			type: String,
			enum: ["cod", "razorpay", "stripe"],
			default: "cod",
		},

		paymentStatus: {
			type: String,
			enum: ["pending", "paid", "failed", "refunded"],
			default: "pending",
		},

		orderStatus: {
			type: String,
			enum: [
				"pending",
				"confirmed",
				"processing",
				"shipped",
				"delivered",
				"cancelled",
			],
			default: "pending",
		},

		subTotal: {
			type: Number,
			required: true,
		},

		shippingCharge: {
			type: Number,
			default: 0,
		},

		totalAmount: {
			type: Number,
			required: true,
		},

		isPaid: {
			type: Boolean,
			default: false,
		},

		razorpayOrderId: String,

		razorpayPaymentId: String,

		razorpaySignature: String,

		paidAt: Date,

		deliveredAt: Date,
	},
	{ timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
