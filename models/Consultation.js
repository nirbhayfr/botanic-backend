import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			trim: true,
			lowercase: true,
		},
		goal: {
			type: String,
			required: [true, "Primary wellness goal is required"],
			trim: true,
		},
		notes: {
			type: String,
			trim: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{ timestamps: true },
);

const Consultation = mongoose.model("Consultation", consultationSchema);

export default Consultation;
