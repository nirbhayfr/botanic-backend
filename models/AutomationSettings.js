import mongoose from "mongoose";

const eventSettingsSchema = new mongoose.Schema(
	{
		enabled: {
			type: Boolean,
			default: false,
		},
		templateName: {
			type: String,
			default: "",
		},
		variables: {
			type: [String],
			default: [],
		},
	},
	{ _id: false },
);

const automationSettingsSchema = new mongoose.Schema(
	{
		key: {
			type: String,
			default: "default",
			unique: true,
			immutable: true,
		},
		events: {
			order_placed: eventSettingsSchema,
			order_confirmed: eventSettingsSchema,
			order_shipped: eventSettingsSchema,
			order_delivered: eventSettingsSchema,
			order_cancelled: eventSettingsSchema,
		},
	},
	{ timestamps: true },
);

export const DEFAULT_AUTOMATION_EVENTS = {
	order_placed: {
		enabled: false,
		templateName: "order_placed",
		variables: ["orderId", "amount", "storeName"],
	},
	order_confirmed: {
		enabled: false,
		templateName: "order_confirmed",
		variables: ["orderId", "amount"],
	},
	order_shipped: {
		enabled: false,
		templateName: "order_shipped",
		variables: ["orderId", "statusLink"],
	},
	order_delivered: {
		enabled: false,
		templateName: "order_delivered",
		variables: ["orderId"],
	},
	order_cancelled: {
		enabled: false,
		templateName: "order_cancelled",
		variables: ["orderId"],
	},
};

automationSettingsSchema.statics.getSingleton = async function getSingleton() {
	const settings = await this.findOneAndUpdate(
		{ key: "default" },
		{
			$setOnInsert: {
				key: "default",
				events: DEFAULT_AUTOMATION_EVENTS,
			},
		},
		{ new: true, upsert: true },
	);

	return settings;
};

const AutomationSettings = mongoose.model(
	"AutomationSettings",
	automationSettingsSchema,
);

export default AutomationSettings;
