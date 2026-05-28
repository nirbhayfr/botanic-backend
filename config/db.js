import mongoose from "mongoose";

export const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Database Connected.");
	} catch (err) {
		console.log(err.message);
		throw new Error("Error connecting database", err);
	}
};
