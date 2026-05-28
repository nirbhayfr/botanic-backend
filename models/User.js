import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
	{
		addressLine1: {
			type: String,
		},
		addressLine2: {
			type: String,
		},
		city: {
			type: String,
		},
		state: {
			type: String,
		},
		pinCode: {
			type: String,
			match: [/^\d{6}$/, "PIN Code must be 6 digits"],
		},
		country: {
			type: String,
			default: "India",
		},
	},
	{ _id: false },
);

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true, "First name is required"],
		},
		lastName: {
			type: String,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
		},
		phone: {
			type: String,
			unique: true,
			sparse: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			select: false,
		},
		role: {
			type: String,
			default: "user",
		},

		shippingAddress: {
			type: addressSchema,
			default: undefined,
		},

		isBlocked: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
