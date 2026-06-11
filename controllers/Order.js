import sanitize from "mongo-sanitize";
import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import tryCatch from "../middlewares/errorHandler.js";

import { createOrderSchema } from "../config/zod.js";
import razorpay from "../config/razorpay.js";
import { triggerOrderNotificationAsync } from "../services/orderNotificationService.js";

export const createRazorpayCheckout = tryCatch(async (req, res) => {
	const userId = req.userId;

	const sanitizedBody = sanitize(req.body);

	const validation = createOrderSchema.safeParse(sanitizedBody);

	if (!validation.success) {
		return res.status(400).json({
			message: validation.error.issues[0].message,
		});
	}

	const { items, shippingAddress, contactPhone, contactEmail, customerName } =
		validation.data;

	const orderItems = [];

	let subTotal = 0;

	for (const item of items) {
		const product = await Product.findById(item.product);

		if (!product) {
			return res.status(404).json({
				message: "Product not found",
			});
		}

		if (product.stock < item.quantity) {
			return res.status(400).json({
				message: `${product.title} is out of stock`,
			});
		}

		const itemTotal = product.price * item.quantity;

		subTotal += itemTotal;

		orderItems.push({
			product: product._id,
			title: product.title,
			price: product.price,
			quantity: item.quantity,
			image: product.images?.[0]?.url || "",
		});
	}

	// const shippingCharge = subTotal > 999 ? 0 : 99;
	const shippingCharge = 0;

	const taxAmount = Math.round(subTotal * 0.18);

	const totalAmount = subTotal + taxAmount;

	// Create razorpay order
	const razorpayOrder = await razorpay.orders.create({
		amount: totalAmount * 100,
		currency: "INR",
		receipt: `receipt_${Date.now()}`,
	});

	// Create DB order
	const order = await Order.create({
		user: userId,

		items: orderItems,

		shippingAddress,

		contactPhone,

		contactEmail,

		customerName,

		paymentMethod: "razorpay",

		subTotal,

		shippingCharge,

		totalAmount,

		paymentStatus: "pending",

		razorpayOrderId: razorpayOrder.id,
	});

	triggerOrderNotificationAsync("order_placed", order);

	res.status(201).json({
		order,
		razorpayOrder,
	});
});

export const createOrder = tryCatch(async (req, res) => {
	const userId = req.userId;

	if (!userId) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	const sanitizedBody = sanitize(req.body);

	const validation = createOrderSchema.safeParse(sanitizedBody);

	if (!validation.success) {
		return res.status(400).json({
			message: validation.error.issues[0].message,
		});
	}

	const {
		items,
		shippingAddress,
		paymentMethod,
		contactPhone,
		contactEmail,
		customerName,
	} = validation.data;

	const orderItems = [];

	let subTotal = 0;

	for (const item of items) {
		const product = await Product.findById(item.product);

		if (!product) {
			return res.status(404).json({
				message: "Product not found",
			});
		}

		if (product.stock < item.quantity) {
			return res.status(400).json({
				message: `${product.title} is out of stock`,
			});
		}

		const itemTotal = product.price * item.quantity;

		subTotal += itemTotal;

		orderItems.push({
			product: product._id,
			title: product.title,
			price: product.price,
			quantity: item.quantity,
			image: product.images?.[0]?.url || "",
		});

		product.stock -= item.quantity;

		await product.save();
	}

	// const shippingCharge = subTotal > 999 ? 0 : 99;
	const shippingCharge = 0;

	const taxAmount = Math.round(subTotal * 0.18);

	const totalAmount = subTotal + taxAmount;

	const order = await Order.create({
		user: userId,

		items: orderItems,

		shippingAddress,

		contactPhone,

		contactEmail,

		customerName,

		paymentMethod,

		subTotal,

		shippingCharge,

		totalAmount,
	});

	triggerOrderNotificationAsync("order_placed", order);

	res.status(201).json({
		message: "Order placed successfully",
		data: order,
	});
});

export const getMyOrders = tryCatch(async (req, res) => {
	const userId = req.userId;

	const orders = await Order.find({
		user: userId,
	})
		.populate("items.product")
		.sort({ createdAt: -1 });

	res.status(200).json({
		count: orders.length,
		data: orders,
	});
});

export const getSingleOrder = tryCatch(async (req, res) => {
	const userId = req.userId;

	const { id } = req.params;

	const order = await Order.findOne({
		_id: id,
		user: userId,
	}).populate("items.product");

	if (!order) {
		return res.status(404).json({
			message: "Order not found",
		});
	}

	res.status(200).json({
		data: order,
	});
});

export const updateOrderStatus = tryCatch(async (req, res) => {
	const { id } = req.params;

	const { orderStatus } = req.body;

	const allowedStatuses = [
		"pending",
		"confirmed",
		"processing",
		"shipped",
		"delivered",
		"cancelled",
	];

	if (!allowedStatuses.includes(orderStatus)) {
		return res.status(400).json({
			message: "Invalid order status",
		});
	}

	const order = await Order.findById(id);

	if (!order) {
		return res.status(404).json({
			message: "Order not found",
		});
	}

	order.orderStatus = orderStatus;

	if (orderStatus === "shipped" && !order.shippedAt) {
		order.shippedAt = new Date();
	}

	if (orderStatus === "delivered") {
		order.deliveredAt = new Date();
	}

	await order.save();

	if (orderStatus === "shipped") {
		triggerOrderNotificationAsync("order_shipped", order);
	}

	if (orderStatus === "delivered") {
		triggerOrderNotificationAsync("order_delivered", order);
	}

	if (orderStatus === "cancelled") {
		triggerOrderNotificationAsync("order_cancelled", order);
	}

	res.status(200).json({
		message: "Order status updated successfully",
		data: order,
	});
});

export const cancelOrder = tryCatch(async (req, res) => {
	const userId = req.userId;

	const { id } = req.params;

	const order = await Order.findOne({
		_id: id,
		user: userId,
	});

	if (!order) {
		return res.status(404).json({
			message: "Order not found",
		});
	}

	if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
		return res.status(400).json({
			message: "Cannot cancel shipped or delivered orders",
		});
	}

	order.orderStatus = "cancelled";

	for (const item of order.items) {
		const product = await Product.findById(item.product);

		if (product) {
			product.stock += item.quantity;

			await product.save();
		}
	}

	await order.save();

	triggerOrderNotificationAsync("order_cancelled", order);

	res.status(200).json({
		message: "Order cancelled successfully",
		data: order,
	});
});

export const payOrder = tryCatch(async (req, res) => {
	const { id } = req.params;

	const order = await Order.findById(id);

	if (!order) {
		return res.status(404).json({
			message: "Order not found",
		});
	}

	order.paymentStatus = "paid";
	order.isPaid = true;
	order.paidAt = new Date();
	order.orderStatus = "confirmed";

	await order.save();

	triggerOrderNotificationAsync("order_confirmed", order);

	res.status(200).json({
		message: "Order paid successfully",
		data: order,
	});
});

export const getAllOrders = tryCatch(async (req, res) => {
	const { page = 1, limit = 10, search, orderStatus, paymentStatus } = req.query;

	const query = {};

	if (orderStatus) {
		query.orderStatus = orderStatus;
	}

	if (paymentStatus) {
		query.paymentStatus = paymentStatus;
	}

	if (search) {
		if (mongoose.Types.ObjectId.isValid(search)) {
			query._id = search;
		} else {
			const users = await User.find({
				$or: [
					{ firstName: { $regex: search, $options: "i" } },
					{ lastName: { $regex: search, $options: "i" } },
					{ email: { $regex: search, $options: "i" } },
				],
			}).select("_id");
			
			const userIds = users.map((u) => u._id);
			query.user = { $in: userIds };
		}
	}

	const skip = (Number(page) - 1) * Number(limit);

	const orders = await Order.find(query)
		.populate("user", "firstName lastName email phone")
		.populate("items.product")
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(Number(limit));

	const totalOrders = await Order.countDocuments(query);

	res.status(200).json({
		message: "Orders fetched successfully",
		currentPage: Number(page),
		totalPages: Math.ceil(totalOrders / Number(limit)),
		totalOrders,
		count: orders.length,
		data: orders,
	});
});

export const getOrderStats = tryCatch(async (req, res) => {
	const totalOrders = await Order.countDocuments();
	const totalProducts = await Product.countDocuments();
	const totalUsers = await User.countDocuments();

	const revenueData = await Order.aggregate([
		{
			$match: {
				orderStatus: { $ne: "cancelled" },
				$or: [
					{ paymentStatus: "paid" },
					{ isPaid: true },
					{ paymentMethod: "cod", orderStatus: "delivered" }
				]
			}
		},
		{
			$group: {
				_id: null,
				total: { $sum: "$totalAmount" }
			}
		}
	]);
	const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

	const statusBreakdown = await Order.aggregate([
		{
			$group: {
				_id: "$orderStatus",
				count: { $sum: 1 }
			}
		}
	]);

	const statusCounts = {
		pending: 0,
		confirmed: 0,
		processing: 0,
		shipped: 0,
		delivered: 0,
		cancelled: 0,
	};
	statusBreakdown.forEach((item) => {
		if (statusCounts[item._id] !== undefined) {
			statusCounts[item._id] = item.count;
		}
	});

	const recentOrders = await Order.find()
		.populate("user", "firstName lastName email")
		.sort({ createdAt: -1 })
		.limit(5);

	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	const salesTrend = await Order.aggregate([
		{
			$match: {
				createdAt: { $gte: sevenDaysAgo },
				orderStatus: { $ne: "cancelled" }
			}
		},
		{
			$group: {
				_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
				sales: { $sum: "$totalAmount" },
				count: { $sum: 1 }
			}
		},
		{ $sort: { _id: 1 } }
	]);

	res.status(200).json({
		success: true,
		data: {
			totalOrders,
			totalProducts,
			totalUsers,
			totalRevenue,
			statusCounts,
			recentOrders,
			salesTrend
		}
	});
});
