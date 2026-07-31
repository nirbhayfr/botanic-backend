import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Field name is required"],
			trim: true,
		},

		label: {
			type: String,
			required: [true, "Field label is required"],
			trim: true,
		},

		type: {
			type: String,
			required: [true, "Field type is required"],
			enum: [
				"text",
				"textarea",
				"number",
				"boolean",
				"date",
				"image",
				"select",
			],
		},

		required: {
			type: Boolean,
			default: false,
		},

		defaultValue: {
			type: mongoose.Schema.Types.Mixed,
		},

		options: [
			{
				type: String,
				trim: true,
			},
		],
	},
	{ _id: false },
);

const contentTypeSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Content type name is required"],
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

		fields: [fieldSchema],
	},
	{ timestamps: true },
);

const ContentType = mongoose.model("ContentType", contentTypeSchema);

export default ContentType;

