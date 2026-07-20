import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";

import { connectDB } from "./config/db.js";

import userRouter from "./routes/User.js";
import productRouter from "./routes/Product.js";
import categoryRouter from "./routes/Category.js";
import orderRouter from "./routes/Order.js";
import reviewRouter from "./routes/Review.js";
import paymentRouter from "./routes/Razorpay.js";
import consultationRouter from "./routes/Consultation.js";
import automationRouter from "./routes/Automation.js";
import heroSlideRouter from "./routes/HeroSlide.js";

connectDB();

const app = express();
app.use(express.json());
app.use(
	cors({
		origin: [
			"http://localhost:3000",
			"http://localhost:5173",
			"https://be-botanic.vercel.app",
			"https://www.bebotanic.com",
			"https://drops-nk7ruc7h0-nirbhays-projects-41ffadb8.vercel.app",
		],
		credentials: true,
	}),
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/consultation", consultationRouter);
app.use("/api/v1/automation", automationRouter);
app.use("/api/v1/hero-slides", heroSlideRouter);

app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log("Server listening at port", PORT);
});
