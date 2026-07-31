import Banner from "../models/Banner.js";
import ContentEntry from "../models/ContentEntry.js";
import ContentType from "../models/ContentType.js";
import Coupon from "../models/Coupon.js";
import Menu from "../models/Menu.js";
import Notification from "../models/Notification.js";
import Page from "../models/Page.js";
import Post from "../models/Post.js";
import PostCategory from "../models/PostCategory.js";
import Settings from "../models/Settings.js";

const menuItems = {
	header: [
		{ label: "Home", url: "/", order: 0, target: "_self" },
		{ label: "About", url: "/about", order: 1, target: "_self" },
		{ label: "Shop", url: "/shop", order: 2, target: "_self" },
		{ label: "Journal", url: "/journal", order: 3, target: "_self" },
		{ label: "Contact", url: "/contact", order: 4, target: "_self" },
	],
	footer: [
		{ label: "Home", url: "/", order: 0, target: "_self" },
		{ label: "About Us", url: "/about", order: 1, target: "_self" },
		{ label: "Shop All", url: "/shop", order: 2, target: "_self" },
		{ label: "The Journal", url: "/journal", order: 3, target: "_self" },
		{ label: "Contact Us", url: "/contact", order: 4, target: "_self" },
		{ label: "Privacy Policy", url: "/pages/privacy-policy", order: 5, target: "_self" },
	],
	mobile: [
		{ label: "Home", url: "/", order: 0, target: "_self" },
		{ label: "About", url: "/about", order: 1, target: "_self" },
		{ label: "Shop", url: "/shop", order: 2, target: "_self" },
		{ label: "Journal", url: "/journal", order: 3, target: "_self" },
		{ label: "Contact Us", url: "/contact", order: 4, target: "_self" },
	],
};

const banners = [
	{ title: "Botanical Wellness, Made Daily", eyebrow: "Rooted in Ayurveda", subtitle: "Thoughtfully prepared Ayurvedic formulations designed to fit naturally into your everyday wellness ritual.", image: "/assets/img/hero.png", buttonText: "Shop the Collection", buttonLink: "/shop", position: "homepage", order: 0, status: "active" },
	{ title: "Daily Care, Powered by Plants", eyebrow: "Plant-Based Rituals", subtitle: "Discover precise botanical blends for energy, balance, digestion, recovery, and complete daily care.", image: "/assets/img/slider-1.png", buttonText: "Explore Products", buttonLink: "/shop", position: "homepage", order: 1, status: "active" },
	{ title: "Ancient Wisdom, Modern Routine", eyebrow: "The Veadya Method", subtitle: "Simple Ayurvedic formats made for consistency, transparency, and your modern lifestyle.", image: "/assets/img/slider-2.png", buttonText: "Our Story", buttonLink: "/about", position: "homepage", order: 2, status: "active" },
];

const contentTypes = [
	{
		name: "Announcement Bar", slug: "announcement-bar", description: "Messages displayed above the main navigation.",
		fields: [
			{ name: "message", label: "Message", type: "text", required: true },
			{ name: "icon", label: "Font Awesome Icon", type: "text", required: false },
		],
	},
	{
		name: "Homepage Section", slug: "homepage-section", description: "Reusable managed content for homepage storytelling sections.",
		fields: [
			{ name: "section", label: "Section Key", type: "select", required: true, options: ["our-story", "full-veadya-edit", "community", "bottom-banner", "watch-shop"] },
			{ name: "eyebrow", label: "Eyebrow", type: "text", required: false },
			{ name: "title", label: "Title", type: "text", required: true },
			{ name: "description", label: "Description", type: "textarea", required: true },
			{ name: "image", label: "Image", type: "image", required: false },
			{ name: "buttonText", label: "Button Text", type: "text", required: false },
			{ name: "buttonLink", label: "Button Link", type: "text", required: false },
		],
	},
	{
		name: "Trust Point", slug: "trust-point", description: "Trust badges displayed below the homepage hero.",
		fields: [
			{ name: "title", label: "Title", type: "text", required: true },
			{ name: "description", label: "Description", type: "textarea", required: true },
			{ name: "icon", label: "Icon", type: "text", required: false },
			{ name: "order", label: "Order", type: "number", required: false },
		],
	},
];

const pages = [
	{
		title: "Privacy Policy", slug: "privacy-policy", excerpt: "How Veadya handles and protects your information.",
		content: "Veadya respects your privacy. We collect only the information required to process orders, provide support, and improve your experience. We do not sell personal information. Contact us for access, correction, or deletion requests.",
		status: "published", seoTitle: "Privacy Policy | Veadya", seoDescription: "Read Veadya's privacy and data-handling policy.", seoKeywords: ["privacy", "Veadya"],
	},
	{
		title: "Terms of Service", slug: "terms-of-service", excerpt: "Terms governing use of the Veadya website and services.",
		content: "By using this website, you agree to provide accurate information and use our services lawfully. Product information is educational and is not a substitute for professional medical advice.",
		status: "published", seoTitle: "Terms of Service | Veadya", seoDescription: "Terms for using the Veadya website.", seoKeywords: ["terms", "Veadya"],
	},
	{
		title: "Shipping & Returns", slug: "shipping-and-returns", excerpt: "Delivery, cancellation, and return guidance.",
		content: "Orders are prepared with care and dispatched to the address supplied at checkout. If an item arrives damaged or incorrect, contact our support team with your order details and photographs so we can help.",
		status: "published", seoTitle: "Shipping and Returns | Veadya", seoDescription: "Veadya shipping and return information.", seoKeywords: ["shipping", "returns"],
	},
];

const postCategories = [
	{ name: "Ayurvedic Living", slug: "ayurvedic-living", description: "Practical ways to bring Ayurvedic wisdom into modern life.", status: "active" },
	{ name: "Botanical Notes", slug: "botanical-notes", description: "Ingredient stories and formulation knowledge.", status: "active" },
];

const posts = [
	{
		title: "Building a Consistent Botanical Ritual", slug: "building-a-consistent-botanical-ritual",
		excerpt: "Small, repeatable choices are often more useful than dramatic wellness resets.",
		content: "A botanical ritual works best when it fits naturally into your day. Begin with one clear intention, choose a consistent time, and observe how the practice feels over several weeks. Keep the ritual simple enough to repeat and treat it as supportive care rather than a quick fix.",
		featuredImage: "/assets/img/blog.png", status: "published", categorySlug: "ayurvedic-living",
		seoTitle: "How to Build a Botanical Wellness Ritual", seoDescription: "A practical guide to creating a consistent botanical routine.", seoKeywords: ["wellness ritual", "Ayurveda"],
	},
	{
		title: "Why Ingredient Transparency Matters", slug: "why-ingredient-transparency-matters",
		excerpt: "Clear labels help you make thoughtful decisions about everyday wellness products.",
		content: "Ingredient transparency begins with plain language: what is included, why it is included, and how the product is intended to be used. Look for complete disclosures, sensible serving guidance, and claims that respect the limits of botanical support.",
		featuredImage: "/assets/img/ingredients.png", status: "published", categorySlug: "botanical-notes",
		seoTitle: "Ingredient Transparency in Botanical Wellness", seoDescription: "What transparent botanical product information should include.", seoKeywords: ["ingredients", "botanical wellness"],
	},
];

const entries = [
	{ type: "announcement-bar", seedKey: "shipping", data: { message: "FREE SHIPPING ON EVERY ORDER", icon: "fa-solid fa-truck-fast" } },
	{ type: "announcement-bar", seedKey: "natural", data: { message: "100% NATURAL · AYURVEDIC FORMULAS", icon: "fa-solid fa-leaf" } },
	{ type: "trust-point", seedKey: "natural", data: { title: "100% Natural", description: "Sourced directly from earth's bounty.", icon: "fa-solid fa-seedling", order: 0 } },
	{ type: "trust-point", seedKey: "gmp", data: { title: "GMP Certified", description: "Highest global safety standards.", icon: "fa-solid fa-shield-halved", order: 1 } },
	{ type: "trust-point", seedKey: "pure", data: { title: "No Chemicals", description: "Pure botanicals, nothing artificial.", icon: "fa-solid fa-flask-vial", order: 2 } },
	{ type: "trust-point", seedKey: "community", data: { title: "Thousands Trust", description: "Join our community of wellness.", icon: "fa-solid fa-users", order: 3 } },
	{ type: "homepage-section", seedKey: "our-story", data: { section: "our-story", eyebrow: "Pure Botanicals · Ancient Wisdom", title: "Elevate Your Daily Wellness", description: "Discover nutrient-rich juices, high-potency drops, and precision-dosed capsules formulated using authentic Ayurvedic principles.", image: "/assets/img/shop-blend-all.png", buttonText: "Shop All Rituals", buttonLink: "/shop" } },
	{ type: "homepage-section", seedKey: "full-veadya-edit", data: { section: "full-veadya-edit", eyebrow: "The Full Veadya Edit", title: "Ritual Collection", description: "Five pillars of Ayurvedic wellness, distilled into daily ritual.", buttonText: "Explore All Products", buttonLink: "/shop" } },
	{ type: "homepage-section", seedKey: "community", data: { section: "community", eyebrow: "Customer Perspectives · Ancient Wisdom Proven", title: "Trusted by Our Community", description: "Every testimony is a ritual completed. Every review is a life touched by botanical wisdom." } },
	{ type: "homepage-section", seedKey: "bottom-banner", data: { section: "bottom-banner", eyebrow: "Daily Wellness", title: "Discover the Veadya Collection", description: "Botanical care designed for everyday rituals.", image: "/assets/img/about.png", buttonText: "Shop the Collection", buttonLink: "/shop" } },
	{ type: "homepage-section", seedKey: "watch-shop", data: { section: "watch-shop", eyebrow: "Watch & Shop · Interactive Reels", title: "Experience Our Daily Rituals", description: "See how our premium botanical remedies fit into morning and evening wellness routines." } },
];

export const seedSiteContent = async (req, res) => {
	try {
		const assetUrl = (path) => path;

		await Settings.findOneAndUpdate(
			{},
			{
				siteName: "Veadya",
				siteDescription: "Premium Ayurvedic wellness, thoughtfully made for modern rituals.",
				logo: assetUrl("/assets/img/logo.png"),
				favicon: assetUrl("/assets/img/icon.png"),
				contactEmail: "hello@veadya.in",
				contactPhone: "+91 12345 67890",
				address: "Rishikesh, Uttarakhand, India",
				socialLinks: { instagram: "https://instagram.com", facebook: "https://facebook.com", youtube: "https://youtube.com" },
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);

		await Promise.all(Object.entries(menuItems).map(([location, items]) =>
			Menu.findOneAndUpdate({ location }, { name: `${location[0].toUpperCase()}${location.slice(1)} Menu`, location, items }, { upsert: true, new: true, setDefaultsOnInsert: true }),
		));

		await Promise.all(banners.map((banner) =>
			Banner.findOneAndUpdate({ title: banner.title, position: banner.position }, { ...banner, image: assetUrl(banner.image) }, { upsert: true, new: true, setDefaultsOnInsert: true }),
		));

		const typeMap = {};
		for (const type of contentTypes) {
			typeMap[type.slug] = await ContentType.findOneAndUpdate({ slug: type.slug }, type, { upsert: true, new: true, setDefaultsOnInsert: true });
		}
		await Promise.all([
			ContentEntry.deleteMany({
				contentType: typeMap["trust-point"]._id,
				"data.seedKey": { $in: ["transparent"] },
			}),
			ContentEntry.deleteMany({
				contentType: typeMap["homepage-section"]._id,
				"data.seedKey": { $in: ["seasonal-edit", "ritual"] },
			}),
		]);
		await Promise.all(entries.map((entry) =>
			ContentEntry.findOneAndUpdate(
				{ contentType: typeMap[entry.type]._id, "data.seedKey": entry.seedKey },
				{ contentType: typeMap[entry.type]._id, data: { seedKey: entry.seedKey, ...entry.data, ...(entry.data.image && { image: assetUrl(entry.data.image) }) }, status: "published" },
				{ upsert: true, new: true, setDefaultsOnInsert: true },
			),
		));

		await Promise.all(pages.map((page) =>
			Page.findOneAndUpdate({ slug: page.slug }, { ...page, ...(page.featuredImage && { featuredImage: assetUrl(page.featuredImage) }), createdBy: req.userId, updatedBy: req.userId }, { upsert: true, new: true, setDefaultsOnInsert: true }),
		));

		const postCategoryMap = {};
		for (const category of postCategories) {
			postCategoryMap[category.slug] = await PostCategory.findOneAndUpdate({ slug: category.slug }, category, { upsert: true, new: true, setDefaultsOnInsert: true });
		}
		await Promise.all(posts.map(({ categorySlug, ...post }) =>
			Post.findOneAndUpdate(
				{ slug: post.slug },
				{ ...post, ...(post.featuredImage && { featuredImage: assetUrl(post.featuredImage) }), postCategory: postCategoryMap[categorySlug]._id, author: req.userId, publishedAt: new Date() },
				{ upsert: true, new: true, setDefaultsOnInsert: true },
			),
		));

		const expiryDate = new Date();
		expiryDate.setFullYear(expiryDate.getFullYear() + 1);
		await Coupon.findOneAndUpdate(
			{ code: "WELCOME20" },
			{ code: "WELCOME20", description: "20% off a first Veadya order.", type: "percentage", value: 20, minOrderAmount: 499, maxDiscount: 500, usageLimit: 1000, startDate: new Date(), expiryDate, status: "active" },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);
		await Notification.findOneAndUpdate(
			{ title: "Veadya storefront content is ready" },
			{ title: "Veadya storefront content is ready", message: "Banners, menus, settings, CMS content, pages, posts, and the welcome coupon have been initialized.", type: "system", status: "active" },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);

		res.status(200).json({
			message: "Full storefront content seeded successfully.",
			data: {
				settings: 1, menus: Object.keys(menuItems).length, banners: banners.length,
				contentTypes: contentTypes.length, contentEntries: entries.length,
				pages: pages.length, postCategories: postCategories.length, posts: posts.length,
				coupons: 1, notifications: 1,
			},
		});
	} catch (error) {
		console.error("Full site seed failed:", error);
		res.status(500).json({ message: error.message || "Failed to seed site content." });
	}
};
