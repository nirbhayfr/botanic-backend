import sanitize from "mongo-sanitize";
import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import tryCatch from "../middlewares/errorHandler.js";

import { createOrderSchema } from "../config/zod.js";
import razorpay from "../config/razorpay.js";
import { triggerOrderNotificationAsync } from "../services/orderNotificationService.js";

const normalizePinCode = (value = "") => String(value).replace(/\D/g, "");

const normalizeOrderPayload = (body) => {
	const rawAddress = body.shippingAddress || body.address || {};
	const paymentMethod =
		body.paymentMethod === "online" ? "razorpay" : body.paymentMethod || "cod";

	return {
		...body,
		items: (body.items || []).map((item) => ({
			...item,
			product: item.product ? String(item.product) : undefined,
			frontendId:
				item.frontendId !== undefined || item.id !== undefined
					? String(item.frontendId ?? item.id)
					: undefined,
			quantity: item.quantity || item.qty,
		})),
		shippingAddress: {
			name: rawAddress.name,
			phone: rawAddress.phone,
			email: rawAddress.email,
			addressLine1: rawAddress.addressLine1 || rawAddress.line1,
			addressLine2: rawAddress.addressLine2 || rawAddress.line2,
			city: rawAddress.city,
			state: rawAddress.state,
			pinCode: normalizePinCode(rawAddress.pinCode || rawAddress.pincode),
			country: rawAddress.country || "India",
		},
		paymentMethod,
	};
};

const findProductForOrderItem = async (item) => {
	if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
		return Product.findById(item.product);
	}

	if (item.frontendId) {
		if (mongoose.Types.ObjectId.isValid(item.frontendId)) {
			return Product.findById(item.frontendId);
		}

		return Product.findOne({
			$or: [
				{ slug: item.frontendId },
				{ sku: item.frontendId.toUpperCase() },
			],
		});
	}

	return null;
};

const buildOrderItem = async (item, { decrementStock = false } = {}) => {
	const product = await findProductForOrderItem(item);
	const quantity = item.quantity;

	if (product) {
		if (product.stock < quantity) {
			throw new Error(`${product.title} is out of stock`);
		}

		if (decrementStock) {
			product.stock -= quantity;
			await product.save();
		}

		return {
			orderItem: {
				product: product._id,
				frontendId: item.frontendId,
				title: product.title,
				price: product.price,
				quantity,
				image: product.images?.[0]?.url || item.image || "",
			},
			lineTotal: product.price * quantity,
		};
	}

	if (!item.name || typeof item.price !== "number") {
		const error = new Error("Product not found");
		error.statusCode = 404;
		throw error;
	}

	return {
		orderItem: {
			frontendId: item.frontendId,
			title: item.name,
			price: item.price,
			quantity,
			image: item.image || "",
		},
		lineTotal: item.price * quantity,
	};
};

export const createRazorpayCheckout = tryCatch(async (req, res) => {
	const userId = req.userId;

	const sanitizedBody = normalizeOrderPayload(sanitize(req.body));

	const validation = createOrderSchema.safeParse(sanitizedBody);

	if (!validation.success) {
		return res.status(400).json({
			message: validation.error.issues[0].message,
		});
	}

	const { items, shippingAddress } = validation.data;

	const orderItems = [];

	let subTotal = 0;

	for (const item of items) {
		try {
			const { orderItem, lineTotal } = await buildOrderItem(item);
			subTotal += lineTotal;
			orderItems.push(orderItem);
		} catch (error) {
			return res.status(error.statusCode || 400).json({
				message: error.message,
			});
		}
	}

	const shippingCharge = 0;

	const totalAmount = subTotal + shippingCharge;

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

		contactPhone: shippingAddress?.phone,

		contactEmail: shippingAddress?.email,

		customerName: shippingAddress?.name,

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

	const sanitizedBody = normalizeOrderPayload(sanitize(req.body));

	const validation = createOrderSchema.safeParse(sanitizedBody);

	if (!validation.success) {
		return res.status(400).json({
			message: validation.error.issues[0].message,
		});
	}

	const { items, shippingAddress, paymentMethod } = validation.data;

	const orderItems = [];

	let subTotal = 0;

	for (const item of items) {
		try {
			const { orderItem, lineTotal } = await buildOrderItem(item, {
				decrementStock: true,
			});
			subTotal += lineTotal;
			orderItems.push(orderItem);
		} catch (error) {
			return res.status(error.statusCode || 400).json({
				message: error.message,
			});
		}
	}

	const shippingCharge = 0;

	const totalAmount = subTotal + shippingCharge;

	const order = await Order.create({
		user: userId,

		items: orderItems,

		shippingAddress,

		contactPhone: shippingAddress?.phone,

		contactEmail: shippingAddress?.email,

		customerName: shippingAddress?.name,

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

	const previousStatus = order.orderStatus;
	order.orderStatus = orderStatus;

	if (orderStatus === "delivered") {
		order.deliveredAt = new Date();
	}

	if (orderStatus === "shipped") {
		order.shippedAt = new Date();
	}

	// Refund stock if order gets cancelled by admin
	if (orderStatus === "cancelled" && previousStatus !== "cancelled") {
		for (const item of order.items) {
			if (item.product) {
				const product = await Product.findById(item.product);
				if (product) {
					product.stock += item.quantity;
					await product.save();
				}
			}
		}
	}

	// Re-deduct stock if order is restored from cancelled
	if (previousStatus === "cancelled" && orderStatus !== "cancelled") {
		for (const item of order.items) {
			if (item.product) {
				const product = await Product.findById(item.product);
				if (product) {
					if (product.stock < item.quantity) {
						return res.status(400).json({
							message: `Insufficient stock for product "${product.title}" to restore order. Available stock: ${product.stock}`,
						});
					}
					product.stock -= item.quantity;
					await product.save();
				}
			}
		}
	}

	await order.save();

	if (previousStatus !== orderStatus) {
		const eventByStatus = {
			confirmed: "order_confirmed",
			shipped: "order_shipped",
			delivered: "order_delivered",
			cancelled: "order_cancelled",
		};
		if (eventByStatus[orderStatus]) {
			triggerOrderNotificationAsync(eventByStatus[orderStatus], order);
		}
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
		if (!item.product) {
			continue;
		}

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

	const wasConfirmed = order.orderStatus === "confirmed";
	order.paymentStatus = "paid";
	order.isPaid = true;
	order.paidAt = new Date();
	order.orderStatus = "confirmed";

	await order.save();

	if (!wasConfirmed) {
		triggerOrderNotificationAsync("order_confirmed", order);
	}

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

export const deleteOrder = tryCatch(async (req, res) => {
	const { id } = req.params;

	const deletedOrder = await Order.findByIdAndDelete(id);

	if (!deletedOrder) {
		return res.status(404).json({
			message: "Order not found",
		});
	}

	res.status(200).json({
		message: "Order deleted successfully",
	});
});
