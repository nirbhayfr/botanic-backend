import Order from "../models/Order.js";
import AutomationSettings from "../models/AutomationSettings.js";
import { hasWhatsAppCredentials, sendTemplateMessage } from "./whatsappService.js";

const STORE_NAME = "Be Botanic";

const getOrderId = (order) => `#${String(order._id).slice(-8).toUpperCase()}`;

const getStatusLink = (order) => {
	const baseUrl = process.env.STOREFRONT_URL || "http://localhost:3000";
	return `${baseUrl.replace(/\/$/, "")}/orders/${order._id}`;
};

const buildParameters = (event, order) => {
	const amount = `Rs ${order.totalAmount || 0}`;
	const values = {
		orderId: getOrderId(order),
		amount,
		storeName: STORE_NAME,
		statusLink: getStatusLink(order),
	};

	const map = {
		order_placed: ["orderId", "amount", "storeName"],
		order_confirmed: ["orderId", "amount"],
		order_shipped: ["orderId", "statusLink"],
		order_delivered: ["orderId"],
		order_cancelled: ["orderId"],
	};

	return (map[event] || ["orderId"]).map((key) => values[key]);
};

const appendLog = async (orderId, notification) => {
	await Order.findByIdAndUpdate(orderId, {
		$push: {
			notifications: {
				channel: "whatsapp",
				...notification,
				sentAt: new Date(),
			},
		},
	});
};

export const triggerOrderNotification = async (event, order) => {
	try {
		const settings = await AutomationSettings.getSingleton();
		const eventSettings = settings.events?.[event];

		if (!eventSettings?.enabled) {
			await appendLog(order._id, {
				event,
				status: "skipped",
				error: "Automation disabled",
			});
			return;
		}

		if (!order.contactPhone) {
			await appendLog(order._id, {
				event,
				status: "skipped",
				error: "Missing contact phone",
			});
			return;
		}

		if (!hasWhatsAppCredentials()) {
			await appendLog(order._id, {
				event,
				status: "failed",
				error: "WhatsApp credentials are missing",
			});
			return;
		}

		const messageId = await sendTemplateMessage({
			to: order.contactPhone,
			templateName: eventSettings.templateName || event,
			parameters: buildParameters(event, order),
		});

		await appendLog(order._id, {
			event,
			status: "sent",
			messageId,
		});
	} catch (error) {
		await appendLog(order._id, {
			event,
			status: "failed",
			error: error.message || "Notification failed",
		}).catch(() => {});
	}
};

export const triggerOrderNotificationAsync = (event, order) => {
	setImmediate(() => {
		triggerOrderNotification(event, order).catch((error) => {
			console.error("Order notification failed:", error);
		});
	});
};
