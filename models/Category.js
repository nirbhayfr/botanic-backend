import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Category name is required"],
			trim: true,
			unique: true,
		},

		slug: {
			type: String,
			required: [true, "Slug is required"],
			trim: true,
			lowercase: true,
			unique: true,
		},

		description: {
			type: String,
		},

		image: {
			type: String,
		},

		parentCategory: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			default: null,
		},

		isFeatured: {
			type: Boolean,
			default: false,
		},

		status: {
			type: String,
			enum: ["active", "inactive"],
			default: "active",
		},
	},
	{ timestamps: true },
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
