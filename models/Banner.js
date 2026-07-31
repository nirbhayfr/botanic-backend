import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
		},

		subtitle: {
			type: String,
		},

		eyebrow: {
			type: String,
			trim: true,
		},

		image: {
			type: String,
			required: [true, "Image is required"],
		},

		buttonText: {
			type: String,
		},

		buttonLink: {
			type: String,
		},

		position: {
			type: String,
			enum: ["homepage", "category", "sidebar", "popup"],
			default: "homepage",
		},

		order: {
			type: Number,
			default: 0,
		},

		status: {
			type: String,
			enum: ["active", "inactive"],
			default: "active",
		},
	},
	{ timestamps: true },
);

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
