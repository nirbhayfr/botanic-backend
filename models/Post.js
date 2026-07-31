import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Post title is required"],
			trim: true,
		},

		slug: {
			type: String,
			required: [true, "Slug is required"],
			trim: true,
			lowercase: true,
			unique: true,
		},

		excerpt: {
			type: String,
		},

		content: {
			type: String,
			required: [true, "Post content is required"],
		},

		featuredImage: {
			type: String,
		},

		status: {
			type: String,
			enum: ["draft", "published"],
			default: "draft",
		},

		postCategory: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "PostCategory",
		},

		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},

		seoTitle: {
			type: String,
		},

		seoDescription: {
			type: String,
		},

		seoKeywords: [
			{
				type: String,
			},
		],

		publishedAt: {
			type: Date,
		},
	},
	{ timestamps: true },
);

const Post = mongoose.model("Post", postSchema);

export default Post;

