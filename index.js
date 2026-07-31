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
import contactRouter from "./routes/Contact.js";
import paymentRouter from "./routes/Razorpay.js";
import pageRouter from "./routes/Page.js";
import postRouter from "./routes/Post.js";
import postCategoryRouter from "./routes/PostCategory.js";
import menuRouter from "./routes/Menu.js";
import contentTypeRouter from "./routes/ContentType.js";
import contentEntryRouter from "./routes/ContentEntry.js";
import settingsRouter from "./routes/Settings.js";
import newsletterRouter from "./routes/Newsletter.js";
import couponRouter from "./routes/Coupon.js";
import bannerRouter from "./routes/Banner.js";
import notificationRouter from "./routes/Notification.js";
import seoRouter from "./routes/Seo.js";
import seedRouter from "./routes/Seed.js";
import automationRouter from "./routes/Automation.js";

connectDB();

const app = express();
app.use(express.json());
app.use(
	cors({
		origin: [
			"http://localhost:3000",
			"http://localhost:5173",
			"https://www.bebotanic.com"
		],
		credentials: true,
	}),
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/page", pageRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/post-category", postCategoryRouter);
app.use("/api/v1/menu", menuRouter);
app.use("/api/v1/content-type", contentTypeRouter);
app.use("/api/v1/content", contentEntryRouter);
app.use("/api/v1/settings", settingsRouter);
app.use("/api/v1/newsletter", newsletterRouter);
app.use("/api/v1/coupon", couponRouter);
app.use("/api/v1/banner", bannerRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/seo", seoRouter);
app.use("/api/v1/seed", seedRouter);
app.use("/api/v1/automation", automationRouter);

app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log("Server listening at port", PORT);
});
