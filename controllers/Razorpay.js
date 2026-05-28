import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Create Order
export const createOrder = async (req, res) => {
	try {
		const { amount } = req.body;

		const options = {
			amount: amount * 100,
			currency: "INR",
			receipt: "receipt_" + Date.now(),
		};

		const order = await razorpay.orders.create(options);

		return res.json(order);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Order creation failed" });
	}
};

// Verify Payment
export const verifyPayment = async (req, res) => {
	try {
		const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
			req.body;

		const body = `${razorpay_order_id}|${razorpay_payment_id}`;

		const expectedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
			.update(body)
			.digest("hex");

		if (expectedSignature !== razorpay_signature) {
			return res.status(400).json({
				success: false,
				message: "Invalid signature",
			});
		}

		const order = await Order.findOne({
			razorpayOrderId: razorpay_order_id,
		});

		if (!order) {
			return res.status(404).json({
				message: "Order not found",
			});
		}

		order.paymentStatus = "paid";
		order.isPaid = true;
		order.paidAt = new Date();

		order.orderStatus = "confirmed";

		order.razorpayPaymentId = razorpay_payment_id;
		order.razorpaySignature = razorpay_signature;

		// reduce stock after successful payment
		for (const item of order.items) {
			const product = await Product.findById(item.product);

			if (product) {
				product.stock -= item.quantity;

				await product.save();
			}
		}

		await order.save();

		return res.json({
			success: true,
			order,
		});
	} catch (err) {
		console.error(err);

		return res.status(500).json({
			message: "Verification failed",
		});
	}
};
