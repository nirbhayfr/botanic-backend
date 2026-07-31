import sanitize from "mongo-sanitize";

import Notification from "../models/Notification.js";

import tryCatch from "../middlewares/errorHandler.js";

import { notificationSchema } from "../config/zod.js";

export const createNotification = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

	const validation = notificationSchema.safeParse(sanitizedBody);

	if (!validation.success) {
		const zodError = validation.error;

		let firstErrorMessage = "Validation failed";

		if (zodError?.issues?.length) {
			firstErrorMessage = zodError.issues[0].message;
		}

		return res.status(400).json({
			message: firstErrorMessage,
		});
	}

	const notification = await Notification.create(validation.data);

	res.status(201).json({
		message: "Notification created successfully",
		data: notification,
	});
});

export const getNotifications = tryCatch(async (req, res) => {
	const notifications = await Notification.find()
		.populate("user", "firstName lastName email")
		.sort({
			createdAt: -1,
		});

	res.status(200).json({
		message: "Notifications fetched successfully",
		count: notifications.length,
		data: notifications,
	});
});

export const getMyNotifications = tryCatch(async (req, res) => {
	const notifications = await Notification.find({
		status: "active",
		$or: [{ user: null }, { user: req.userId }],
	})
		.sort({ createdAt: -1 })
		.limit(50)
		.lean();

	const data = notifications.map((notification) => ({
		...notification,
		isRead:
			notification.isRead ||
			(notification.readBy || []).some(
				(userId) => String(userId) === String(req.userId),
			),
		readBy: undefined,
	}));

	res.status(200).json({
		message: "User notifications fetched successfully",
		count: data.length,
		data,
	});
});

export const markMyNotificationAsRead = tryCatch(async (req, res) => {
	const notification = await Notification.findOne({
		_id: req.params.id,
		status: "active",
		$or: [{ user: null }, { user: req.userId }],
	});

	if (!notification) {
		return res.status(404).json({ message: "Notification not found" });
	}

	await Notification.updateOne(
		{ _id: notification._id },
		{ $addToSet: { readBy: req.userId } },
	);

	res.status(200).json({
		message: "Notification marked as read",
		data: { ...notification.toObject(), isRead: true, readBy: undefined },
	});
});

export const markAllMyNotificationsAsRead = tryCatch(async (req, res) => {
	await Notification.updateMany(
		{
			status: "active",
			$or: [{ user: null }, { user: req.userId }],
		},
		{ $addToSet: { readBy: req.userId } },
	);

	res.status(200).json({ message: "All notifications marked as read" });
});

export const getSingleNotification = tryCatch(async (req, res) => {
	const { id } = req.params;

	const notification = await Notification.findById(id).populate(
		"user",
		"firstName lastName email",
	);

	if (!notification) {
		return res.status(404).json({
			message: "Notification not found",
		});
	}

	res.status(200).json({
		message: "Notification fetched successfully",
		data: notification,
	});
});

export const updateNotification = tryCatch(async (req, res) => {
	const { id } = req.params;

	const sanitizedBody = sanitize(req.body);

	const validation = notificationSchema.partial().safeParse(sanitizedBody);

	if (!validation.success) {
		const zodError = validation.error;

		let firstErrorMessage = "Validation failed";

		if (zodError?.issues?.length) {
			firstErrorMessage = zodError.issues[0].message;
		}

		return res.status(400).json({
			message: firstErrorMessage,
		});
	}

	const existingNotification = await Notification.findById(id);

	if (!existingNotification) {
		return res.status(404).json({
			message: "Notification not found",
		});
	}

	const updatedNotification = await Notification.findByIdAndUpdate(
		id,
		validation.data,
		{
			new: true,
			runValidators: true,
		},
	);

	res.status(200).json({
		message: "Notification updated successfully",
		data: updatedNotification,
	});
});

export const deleteNotification = tryCatch(async (req, res) => {
	const { id } = req.params;

	const notification = await Notification.findById(id);

	if (!notification) {
		return res.status(404).json({
			message: "Notification not found",
		});
	}

	await Notification.findByIdAndDelete(id);

	res.status(200).json({
		message: "Notification deleted successfully",
	});
});

export const markAsRead = tryCatch(async (req, res) => {
	const { id } = req.params;

	const notification = await Notification.findById(id);

	if (!notification) {
		return res.status(404).json({
			message: "Notification not found",
		});
	}

	notification.isRead = true;

	await notification.save();

	res.status(200).json({
		message: "Notification marked as read",
		data: notification,
	});
});
