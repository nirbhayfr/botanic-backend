import tryCatch from "../middlewares/errorHandler.js";

import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Post from "../models/Post.js";
import PostCategory from "../models/PostCategory.js";
import Page from "../models/Page.js";
import Settings from "../models/Settings.js";

const xmlEscape = (str) =>
	String(str)
		.replace(/&/g, "&amp;")
		.replace(/'/g, "&apos;")
		.replace(/"/g, "&quot;")
		.replace(/>/g, "&gt;")
		.replace(/</g, "&lt;");


const sitemapUrl = (loc, { lastmod, changefreq = "weekly", priority = "0.5" } = {}) => `
  <url>
    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString().split("T")[0]}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

export const getSitemap = tryCatch(async (req, res) => {
	const siteUrl =
		process.env.SITE_URL?.replace(/\/$/, "") || "https://example.com";

	// Fetch all published / active documents in parallel
	const [products, categories, posts, postCategories, pages] =
		await Promise.all([
			Product.find({ status: "active" }, "slug updatedAt").lean(),
			Category.find({ status: "active" }, "slug updatedAt").lean(),
			Post.find({ status: "published" }, "slug updatedAt").lean(),
			PostCategory.find({ status: "active" }, "slug updatedAt").lean(),
			Page.find({ status: "published" }, "slug updatedAt").lean(),
		]);

	const urls = [
		// Homepage
		sitemapUrl(siteUrl, { changefreq: "daily", priority: "1.0" }),

		// Static shop / blog roots
		sitemapUrl(`${siteUrl}/shop`, { changefreq: "daily", priority: "0.9" }),
		sitemapUrl(`${siteUrl}/blog`, { changefreq: "daily", priority: "0.8" }),

		// Products
		...products.map((p) =>
			sitemapUrl(`${siteUrl}/products/${p.slug}`, {
				lastmod: p.updatedAt,
				changefreq: "weekly",
				priority: "0.8",
			}),
		),

		// Product categories
		...categories.map((c) =>
			sitemapUrl(`${siteUrl}/category/${c.slug}`, {
				lastmod: c.updatedAt,
				changefreq: "weekly",
				priority: "0.7",
			}),
		),

		// Blog posts
		...posts.map((p) =>
			sitemapUrl(`${siteUrl}/blog/${p.slug}`, {
				lastmod: p.updatedAt,
				changefreq: "monthly",
				priority: "0.7",
			}),
		),

		// Blog post categories
		...postCategories.map((pc) =>
			sitemapUrl(`${siteUrl}/blog/category/${pc.slug}`, {
				lastmod: pc.updatedAt,
				changefreq: "weekly",
				priority: "0.6",
			}),
		),

		// CMS pages
		...pages.map((pg) =>
			sitemapUrl(`${siteUrl}/${pg.slug}`, {
				lastmod: pg.updatedAt,
				changefreq: "monthly",
				priority: "0.6",
			}),
		),
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.join("")}
</urlset>`;

	res.set("Content-Type", "application/xml");
	res.set("Cache-Control", "public, max-age=3600"); // cache for 1 hour
	res.status(200).send(xml);
});

// ──────────────────────────────────────────────────────────────
// GET /api/v1/seo/robots.txt
// Generates a robots.txt, respecting a ROBOTS_INDEXING env flag
// ──────────────────────────────────────────────────────────────
export const getRobots = tryCatch(async (req, res) => {
	const siteUrl =
		process.env.SITE_URL?.replace(/\/$/, "") || "https://example.com";

	// Set ROBOTS_INDEXING=false in .env to block all crawlers (e.g. staging)
	const allowIndexing = process.env.ROBOTS_INDEXING !== "false";

	let robotsTxt;

	if (allowIndexing) {
		robotsTxt = `User-agent: *
Allow: /

# Block admin / private API paths
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/

Sitemap: ${siteUrl}/api/v1/seo/sitemap.xml
`;
	} else {
		robotsTxt = `User-agent: *
Disallow: /
`;
	}

	res.set("Content-Type", "text/plain");
	res.set("Cache-Control", "public, max-age=86400"); // cache for 24 hours
	res.status(200).send(robotsTxt);
});

// ──────────────────────────────────────────────────────────────
// GET /api/v1/seo/meta?type=<type>&slug=<slug>
//
// Returns SEO metadata (title, description, keywords, og image)
// for a given content type + slug combo. Supported types:
//   product | category | post | post-category | page
//
// Falls back to site-wide defaults from Settings when a specific
// document doesn't have custom SEO fields.
// ──────────────────────────────────────────────────────────────
export const getSeeMeta = tryCatch(async (req, res) => {
	const { type, slug } = req.query;

	if (!type || !slug) {
		return res.status(400).json({
			message: "Query params 'type' and 'slug' are required",
		});
	}

	// Fetch site-wide defaults in parallel with the specific doc
	const [settings, doc] = await Promise.all([
		Settings.findOne().lean(),
		findDocByTypeAndSlug(type, slug),
	]);

	if (!doc) {
		return res.status(404).json({
			message: `No ${type} found with slug '${slug}'`,
		});
	}

	const siteUrl =
		process.env.SITE_URL?.replace(/\/$/, "") || "https://example.com";

	const siteName = settings?.siteName || "LaunchVeda";
	const siteDescription = settings?.siteDescription || "";

	// Build canonical URL
	const canonical = buildCanonical(siteUrl, type, slug);

	// Resolve SEO fields with fallbacks
	const seoTitle =
		doc.seoTitle || doc.title || doc.name || siteName;

	const seoDescription =
		doc.seoDescription ||
		doc.excerpt ||
		doc.description ||
		siteDescription;

	const seoKeywords = doc.seoKeywords?.length ? doc.seoKeywords : [];

	// OG image – prefer featuredImage, then category image, then nothing
	const ogImage = doc.featuredImage || doc.image || null;

	res.status(200).json({
		message: "SEO metadata fetched successfully",
		data: {
			title: seoTitle,
			description: seoDescription,
			keywords: seoKeywords,
			canonical,
			og: {
				title: seoTitle,
				description: seoDescription,
				image: ogImage,
				url: canonical,
				siteName,
				type: type === "post" ? "article" : "website",
			},
		},
	});
});

// ──────────────────────────────────────────────────────────────
// GET /api/v1/seo/bulk-meta
//
// Body / query: { slugs: [{ type, slug }, ...] }
// Returns SEO metadata for multiple slugs in one call.
// Useful for pre-rendering or SSG pipelines.
// ──────────────────────────────────────────────────────────────
export const getBulkSeoMeta = tryCatch(async (req, res) => {
	// Accept items from the request body OR a JSON query param
	let items = req.body?.slugs;

	if (!items || !Array.isArray(items) || items.length === 0) {
		return res.status(400).json({
			message: "Request body must contain a 'slugs' array of { type, slug } objects",
		});
	}

	// Cap to avoid abuse
	if (items.length > 100) {
		return res.status(400).json({
			message: "Maximum 100 slugs allowed per request",
		});
	}

	const siteUrl =
		process.env.SITE_URL?.replace(/\/$/, "") || "https://example.com";

	const [settings] = await Promise.all([Settings.findOne().lean()]);
	const siteName = settings?.siteName || "LaunchVeda";
	const siteDescription = settings?.siteDescription || "";

	// Resolve all docs in parallel
	const results = await Promise.all(
		items.map(async ({ type, slug }) => {
			const doc = await findDocByTypeAndSlug(type, slug);

			if (!doc) {
				return { type, slug, found: false, data: null };
			}

			const canonical = buildCanonical(siteUrl, type, slug);
			const seoTitle = doc.seoTitle || doc.title || doc.name || siteName;
			const seoDescription =
				doc.seoDescription || doc.excerpt || doc.description || siteDescription;
			const seoKeywords = doc.seoKeywords?.length ? doc.seoKeywords : [];
			const ogImage = doc.featuredImage || doc.image || null;

			return {
				type,
				slug,
				found: true,
				data: {
					title: seoTitle,
					description: seoDescription,
					keywords: seoKeywords,
					canonical,
					og: {
						title: seoTitle,
						description: seoDescription,
						image: ogImage,
						url: canonical,
						siteName,
						type: type === "post" ? "article" : "website",
					},
				},
			};
		}),
	);

	res.status(200).json({
		message: "Bulk SEO metadata fetched successfully",
		data: results,
	});
});

// ──────────────────────────────────────────────────────────────
// Private helpers
// ──────────────────────────────────────────────────────────────

/**
 * Look up a document by its content type label and slug.
 * Returns a lean object or null.
 */
async function findDocByTypeAndSlug(type, slug) {
	const safeSlug = String(slug).toLowerCase().trim();

	switch (type) {
		case "product":
			return Product.findOne(
				{ slug: safeSlug, status: "active" },
				"title slug seoTitle seoDescription seoKeywords description featuredImage images",
			).lean();

		case "category":
			return Category.findOne(
				{ slug: safeSlug, status: "active" },
				"name slug description image",
			).lean();

		case "post":
			return Post.findOne(
				{ slug: safeSlug, status: "published" },
				"title slug excerpt seoTitle seoDescription seoKeywords featuredImage",
			).lean();

		case "post-category":
			return PostCategory.findOne(
				{ slug: safeSlug, status: "active" },
				"name slug description",
			).lean();

		case "page":
			return Page.findOne(
				{ slug: safeSlug, status: "published" },
				"title slug excerpt seoTitle seoDescription seoKeywords featuredImage",
			).lean();

		default:
			return null;
	}
}

/**
 * Build a canonical URL for a given content type + slug.
 */
function buildCanonical(siteUrl, type, slug) {
	const map = {
		product: `${siteUrl}/products/${slug}`,
		category: `${siteUrl}/category/${slug}`,
		post: `${siteUrl}/blog/${slug}`,
		"post-category": `${siteUrl}/blog/category/${slug}`,
		page: `${siteUrl}/${slug}`,
	};

	return map[type] ?? `${siteUrl}/${slug}`;
}

