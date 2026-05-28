import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},

		rating: {
			type: Number,
			required: [true, "Rating is required"],
			min: [1, "Minimum rating is 1"],
			max: [5, "Maximum rating is 5"],
		},

		comment: {
			type: String,
			required: [true, "Comment is required"],
			trim: true,
		},
	},
	{ timestamps: true },
);

reviewSchema.index(
	{
		user: 1,
		product: 1,
	},
	{
		unique: true,
	},
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
