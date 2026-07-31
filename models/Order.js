import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
		},

		frontendId: {
			type: String,
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
		name: String,
		phone: String,
		email: String,
		addressLine1: String,
		addressLine2: String,
		city: String,
		state: String,
		pinCode: String,
		country: String,
	},
	{ _id: false },
);

const notificationSchema = new mongoose.Schema(
	{
		channel: {
			type: String,
			enum: ["whatsapp"],
			default: "whatsapp",
		},
		event: {
			type: String,
			enum: [
				"order_placed",
				"order_confirmed",
				"order_shipped",
				"order_delivered",
				"order_cancelled",
			],
			required: true,
		},
		status: {
			type: String,
			enum: ["sent", "failed", "skipped"],
			required: true,
		},
		messageId: String,
		error: String,
		sentAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ _id: true },
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

		contactPhone: String,

		contactEmail: String,

		customerName: String,

		paymentMethod: {
			type: String,
			enum: ["cod", "razorpay"],
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

		shippedAt: Date,

		notifications: [notificationSchema],
	},
	{ timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
