import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import HeroSlide from "../models/HeroSlide.js";

await connectDB({ serverSelectionTimeoutMS: 15000 });
await HeroSlide.findOneAndUpdate(
	{ title: "Made For", highlight: "Diabetic Care" },
	{ $set: {
		eyebrow: "Ayurvedic Blend", title: "Made For", highlight: "Diabetic Care",
		description: "Prepared through a refined herbal extraction process using pharmacopoeial-grade ingredients. Traditionally used to support diabetes management with carefully balanced botanical formulations.",
		backgroundImage: "/assets/img/hero.png", productImage: "/assets/img/pe-1.png",
		productName: "Be Glyvera Plus", productMeta: "1000ml · Advanced Ayurvedic Blend", badge: "Clinically Tested",
		primaryCtaLabel: "Coming Soon", primaryCtaUrl: "", secondaryCtaLabel: "View Methodology", secondaryCtaUrl: "/about",
		stats: [{ value: "100%", label: "Organic" }, { value: "3×", label: "More Absorbable" }, { value: "Zero", label: "Synthetic Fillers" }],
		order: 0, autoplayMs: 6500, status: "active",
	} },
	{ upsert: true, returnDocument: "after" },
);
console.log("Homepage hero slide seeded.");
await mongoose.disconnect();
