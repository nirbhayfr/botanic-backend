import sanitize from "mongo-sanitize";

import AutomationSettings, {
	DEFAULT_AUTOMATION_EVENTS,
} from "../models/AutomationSettings.js";
import Order from "../models/Order.js";
import tryCatch from "../middlewares/errorHandler.js";
import { hasWhatsAppCredentials } from "../services/whatsappService.js";

const EVENT_KEYS = Object.keys(DEFAULT_AUTOMATION_EVENTS);

export const getAutomationSettings = tryCatch(async (req, res) => {
	const settings = await AutomationSettings.getSingleton();

	res.status(200).json({
		data: settings,
		connection: {
			hasCredentials: hasWhatsAppCredentials(),
			phoneNumberIdPresent: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
			accessTokenPresent: Boolean(process.env.WHATSAPP_ACCESS_TOKEN),
		},
	});
});

export const updateAutomationSettings = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);
	const existing = await AutomationSettings.getSingleton();
	const incomingEvents = sanitizedBody.events || {};

	for (const eventKey of EVENT_KEYS) {
		const current = existing.events?.[eventKey]?.toObject?.() ||
			DEFAULT_AUTOMATION_EVENTS[eventKey];
		const incoming = incomingEvents[eventKey] || {};

		existing.events[eventKey] = {
			...current,
			enabled:
				typeof incoming.enabled === "boolean"
					? incoming.enabled
					: current.enabled,
			templateName:
				typeof incoming.templateName === "string"
					? incoming.templateName
					: current.templateName,
			variables: Array.isArray(incoming.variables)
				? incoming.variables
				: current.variables,
		};
	}

	await existing.save();

	res.status(200).json({
		message: "Automation settings updated successfully",
		data: existing,
	});
});

export const getNotificationLogs = tryCatch(async (req, res) => {
	const limit = Math.min(Number(req.query.limit) || 50, 100);

	const logs = await Order.aggregate([
		{ $unwind: "$notifications" },
		{ $sort: { "notifications.sentAt": -1 } },
		{ $limit: limit },
		{
			$project: {
				_id: "$notifications._id",
				orderId: "$_id",
				orderStatus: "$orderStatus",
				customerName: "$customerName",
				contactPhone: "$contactPhone",
				channel: "$notifications.channel",
				event: "$notifications.event",
				status: "$notifications.status",
				messageId: "$notifications.messageId",
				error: "$notifications.error",
				sentAt: "$notifications.sentAt",
			},
		},
	]);

	res.status(200).json({
		count: logs.length,
		data: logs,
	});
});
