import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: [true, "Email is required"],
			trim: true,
			lowercase: true,
			unique: true,
		},

		status: {
			type: String,
			enum: ["active", "unsubscribed"],
			default: "active",
		},
	},
	{ timestamps: true },
);

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

export default Newsletter;

