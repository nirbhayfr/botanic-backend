import mongoose from "mongoose";

const postCategorySchema = new mongoose.Schema(
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

		status: {
			type: String,
			enum: ["active", "inactive"],
			default: "active",
		},
	},
	{ timestamps: true },
);

const PostCategory = mongoose.model("PostCategory", postCategorySchema);

export default PostCategory;

