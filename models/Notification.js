import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
		},

		message: {
			type: String,
			required: [true, "Message is required"],
		},

		type: {
			type: String,
			enum: ["system", "order", "promotion", "announcement"],
			default: "system",
		},

		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},

		isRead: {
			type: Boolean,
			default: false,
		},

		readBy: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		}],

		status: {
			type: String,
			enum: ["active", "inactive"],
			default: "active",
		},
	},
	{ timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
