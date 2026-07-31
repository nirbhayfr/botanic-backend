import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import Post from "../models/Post.js";
import PostCategory from "../models/PostCategory.js";

const categories = [
	{
		name: "Ayurvedic Living",
		slug: "ayurvedic-living",
		description: "Practical Ayurvedic wisdom for modern daily life.",
		status: "active",
	},
	{
		name: "Botanical Notes",
		slug: "botanical-notes",
		description: "Ingredient stories, sourcing, and formulation knowledge.",
		status: "active",
	},
];

const posts = [
	{
		title: "Building a Consistent Botanical Ritual",
		slug: "building-a-consistent-botanical-ritual",
		excerpt:
			"Small, repeatable choices are often more useful than dramatic wellness resets.",
		content:
			"A botanical ritual works best when it fits naturally into your day.\n\nBegin with one clear intention, choose a consistent time, and observe how the practice feels over several weeks. Keep the ritual simple enough to repeat and treat it as supportive care rather than a quick fix.\n\nConsistency creates the space to notice what genuinely works for your routine.",
		featuredImage: "/assets/img/blog.png",
		status: "published",
		categorySlug: "ayurvedic-living",
		seoTitle: "How to Build a Botanical Wellness Ritual",
		seoDescription:
			"A practical guide to creating a consistent botanical routine.",
		seoKeywords: ["wellness ritual", "Ayurveda", "daily routine"],
	},
	{
		title: "Why Ingredient Transparency Matters",
		slug: "why-ingredient-transparency-matters",
		excerpt:
			"Clear labels help you make thoughtful decisions about everyday wellness products.",
		content:
			"Ingredient transparency begins with plain language: what is included, why it is included, and how the product is intended to be used.\n\nLook for complete disclosures, sensible serving guidance, and claims that respect the limits of botanical support. Transparent information makes it easier to compare products and choose a ritual that suits your needs.",
		featuredImage: "/assets/img/ingredients.png",
		status: "published",
		categorySlug: "botanical-notes",
		seoTitle: "Ingredient Transparency in Botanical Wellness",
		seoDescription:
			"What transparent botanical product information should include.",
		seoKeywords: ["ingredients", "botanical wellness", "transparency"],
	},
	{
		title: "Ayurveda for the Modern Morning",
		slug: "ayurveda-for-the-modern-morning",
		excerpt:
			"A calm morning ritual can be simple, intentional, and realistic.",
		content:
			"A modern Ayurvedic morning does not need to be complicated.\n\nStart with hydration, create a few quiet minutes before screens, and choose a nourishing routine you can repeat. The goal is not perfection; it is a steadier transition into the day.\n\nA useful ritual should support your life, not compete with it.",
		featuredImage: "/assets/img/story.png",
		status: "published",
		categorySlug: "ayurvedic-living",
		seoTitle: "A Simple Modern Ayurvedic Morning Routine",
		seoDescription:
			"Simple ideas for building a calm and consistent Ayurvedic morning.",
		seoKeywords: ["morning routine", "Ayurveda", "wellness"],
	},
];

const seedBlogs = async () => {
	try {
		await connectDB();

		const categoryMap = {};
		for (const category of categories) {
			categoryMap[category.slug] = await PostCategory.findOneAndUpdate(
				{ slug: category.slug },
				category,
				{ upsert: true, new: true, runValidators: true },
			);
		}

		for (const { categorySlug, ...post } of posts) {
			await Post.findOneAndUpdate(
				{ slug: post.slug },
				{
					...post,
					postCategory: categoryMap[categorySlug]._id,
					publishedAt: new Date(),
				},
				{ upsert: true, new: true, runValidators: true },
			);
		}

		console.log(
			`Seeded ${posts.length} published blog posts with deployment-safe relative assets.`,
		);
	} catch (error) {
		console.error("Blog seed failed:", error.message);
		process.exitCode = 1;
	} finally {
		await mongoose.connection.close();
	}
};

seedBlogs();
