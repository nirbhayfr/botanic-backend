import express from "express";

import {
	getSitemap,
	getRobots,
	getSeeMeta,
	getBulkSeoMeta,
} from "../controllers/Seo.js";

const router = express.Router();

// XML Sitemap  →  GET /api/v1/seo/sitemap.xml
router.get("/sitemap.xml", getSitemap);

// Robots.txt   →  GET /api/v1/seo/robots.txt
router.get("/robots.txt", getRobots);

// Per-slug SEO meta  →  GET /api/v1/seo/meta?type=post&slug=my-post
router.get("/meta", getSeeMeta);

// Bulk SEO meta  →  POST /api/v1/seo/bulk-meta
// Body: { slugs: [{ type: "post", slug: "my-post" }, ...] }
router.post("/bulk-meta", getBulkSeoMeta);

export default router;

