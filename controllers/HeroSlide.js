import sanitize from "mongo-sanitize";
import HeroSlide from "../models/HeroSlide.js";
import tryCatch from "../middlewares/errorHandler.js";

export const getHeroSlides = tryCatch(async (req, res) => {
	const query = req.query.all === "true" ? {} : { status: "active" };
	const slides = await HeroSlide.find(query).sort({ order: 1, createdAt: 1 });
	res.status(200).json({ count: slides.length, data: slides });
});

export const createHeroSlide = tryCatch(async (req, res) => {
	const data = sanitize(req.body);
	if (!data.title?.trim() || !data.backgroundImage?.trim()) return res.status(400).json({ message: "Title and background image are required" });
	const slide = await HeroSlide.create(data);
	res.status(201).json({ message: "Hero slide created", data: slide });
});

export const updateHeroSlide = tryCatch(async (req, res) => {
	const slide = await HeroSlide.findByIdAndUpdate(req.params.id, sanitize(req.body), { new: true, runValidators: true });
	if (!slide) return res.status(404).json({ message: "Hero slide not found" });
	res.status(200).json({ message: "Hero slide updated", data: slide });
});

export const deleteHeroSlide = tryCatch(async (req, res) => {
	const slide = await HeroSlide.findByIdAndDelete(req.params.id);
	if (!slide) return res.status(404).json({ message: "Hero slide not found" });
	res.status(200).json({ message: "Hero slide deleted" });
});
