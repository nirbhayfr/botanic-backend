import mongoose from "mongoose";

const contentEntrySchema = new mongoose.Schema(
	{
		contentType: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ContentType",
			required: [true, "Content type is required"],
		},

		data: {
			type: mongoose.Schema.Types.Mixed,
			required: [true, "Content data is required"],
		},

		status: {
			type: String,
			enum: ["draft", "published"],
			default: "draft",
		},
	},
	{ timestamps: true },
);

const ContentEntry = mongoose.model("ContentEntry", contentEntrySchema);

export default ContentEntry;

