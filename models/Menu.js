import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
	{
		label: {
			type: String,
			required: [true, "Menu item label is required"],
			trim: true,
		},

		url: {
			type: String,
			required: [true, "Menu item url is required"],
			trim: true,
		},

		order: {
			type: Number,
			default: 0,
		},

		target: {
			type: String,
			enum: ["_self", "_blank"],
			default: "_self",
		},
	},
	{ _id: false },
);

const menuSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Menu name is required"],
			trim: true,
			unique: true,
		},

		location: {
			type: String,
			required: [true, "Menu location is required"],
			enum: ["header", "footer", "mobile"],
		},

		items: [menuItemSchema],
	},
	{ timestamps: true },
);

const Menu = mongoose.model("Menu", menuSchema);

export default Menu;

