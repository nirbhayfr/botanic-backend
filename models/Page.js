import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Page title is required"],
			trim: true,
		},

		slug: {
			type: String,
			required: [true, "Slug is required"],
			trim: true,
			lowercase: true,
			unique: true,
		},

		content: {
			type: String,
			required: [true, "Page content is required"],
		},

		excerpt: {
			type: String,
			default: "",
		},

		featuredImage: {
			type: String,
			default: "",
		},

		status: {
			type: String,
			enum: ["draft", "published"],
			default: "draft",
		},

		seoTitle: {
			type: String,
			trim: true,
		},

		seoDescription: {
			type: String,
			trim: true,
		},

		seoKeywords: [
			{
				type: String,
				trim: true,
			},
		],

		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},

		updatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{ timestamps: true },
);

const Page = mongoose.model("Page", pageSchema);

export default Page;

