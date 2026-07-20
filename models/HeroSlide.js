import mongoose from "mongoose";

const statSchema = new mongoose.Schema({ value: String, label: String }, { _id: false });

const heroSlideSchema = new mongoose.Schema({
	eyebrow: { type: String, default: "Ayurvedic Blend" },
	title: { type: String, required: true },
	highlight: String,
	description: String,
	backgroundImage: { type: String, required: true },
	productImage: String,
	productName: String,
	productMeta: String,
	badge: String,
	primaryCtaLabel: String,
	primaryCtaUrl: String,
	secondaryCtaLabel: String,
	secondaryCtaUrl: String,
	stats: [statSchema],
	order: { type: Number, default: 0 },
	autoplayMs: { type: Number, default: 6500, min: 2000 },
	status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

export default mongoose.model("HeroSlide", heroSlideSchema);
