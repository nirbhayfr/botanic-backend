import sanitize from "mongo-sanitize";

import Menu from "../models/Menu.js";

import tryCatch from "../middlewares/errorHandler.js";

import { menuSchema } from "../config/zod.js";

export const createMenu = tryCatch(async (req, res) => {
	const sanitizedBody = sanitize(req.body);

	const validation = menuSchema.safeParse(sanitizedBody);

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

	const { name } = validation.data;

	const existingMenu = await Menu.findOne({ name });

	if (existingMenu) {
		return res.status(400).json({
			message: "Menu already exists",
		});
	}

	const menu = await Menu.create(validation.data);

	res.status(201).json({
		message: "Menu created successfully",
		data: menu,
	});
});

export const getMenus = tryCatch(async (req, res) => {
	const menus = await Menu.find().sort({ createdAt: -1 });

	res.status(200).json({
		message: "Menus fetched successfully",
		count: menus.length,
		data: menus,
	});
});

export const getSingleMenu = tryCatch(async (req, res) => {
	const { id } = req.params;

	const menu = await Menu.findById(id);

	if (!menu) {
		return res.status(404).json({
			message: "Menu not found",
		});
	}

	res.status(200).json({
		message: "Menu fetched successfully",
		data: menu,
	});
});

export const getMenuByLocation = tryCatch(async (req, res) => {
	const { location } = req.params;

	const menu = await Menu.findOne({ location });

	if (!menu) {
		return res.status(404).json({
			message: "Menu not found",
		});
	}

	res.status(200).json({
		message: "Menu fetched successfully",
		data: menu,
	});
});

export const updateMenu = tryCatch(async (req, res) => {
	const { id } = req.params;

	const sanitizedBody = sanitize(req.body);

	const validation = menuSchema.partial().safeParse(sanitizedBody);

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

	const existingMenu = await Menu.findById(id);

	if (!existingMenu) {
		return res.status(404).json({
			message: "Menu not found",
		});
	}

	if (validation.data.name) {
		const existingName = await Menu.findOne({
			name: validation.data.name,
			_id: { $ne: id },
		});

		if (existingName) {
			return res.status(400).json({
				message: "Menu name already exists",
			});
		}
	}

	const updatedMenu = await Menu.findByIdAndUpdate(id, validation.data, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		message: "Menu updated successfully",
		data: updatedMenu,
	});
});

export const deleteMenu = tryCatch(async (req, res) => {
	const { id } = req.params;

	const menu = await Menu.findById(id);

	if (!menu) {
		return res.status(404).json({
			message: "Menu not found",
		});
	}

	await Menu.findByIdAndDelete(id);

	res.status(200).json({
		message: "Menu deleted successfully",
	});
});

