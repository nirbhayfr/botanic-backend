const PRODUCT_CATEGORIES = ["Capsule", "Juice", "Drop"];

const responseSchema = {
	type: "OBJECT",
	properties: {
		description: { type: "STRING" },
		price: { type: "NUMBER" },
		originalPrice: { type: "NUMBER" },
		stock: { type: "INTEGER" },
		sku: { type: "STRING" },
		categoryName: { type: "STRING", enum: PRODUCT_CATEGORIES },
		size: { type: "STRING" },
		tags: {
			type: "ARRAY",
			items: { type: "STRING" },
		},
		bg: { type: "STRING" },
		accent: { type: "STRING" },
		textColor: { type: "STRING" },
		subColor: { type: "STRING" },
	},
	required: [
		"description",
		"price",
		"originalPrice",
		"stock",
		"sku",
		"categoryName",
		"size",
		"tags",
		"bg",
		"accent",
		"textColor",
		"subColor",
	],
};

const isHexColor = (value) => /^#[0-9a-f]{6}$/i.test(value);

export const generateProductDetails = async (req, res, next) => {
	try {
		const { title, shortDescription, imageUrl } = req.body;

		if (!title?.trim() || !shortDescription?.trim() || !imageUrl) {
			return res.status(400).json({
				message: "An image, product name, and short description are required to generate details.",
			});
		}

		if (!process.env.GEMINI_API_KEY) {
			return res.status(503).json({
				message: "Gemini is not configured on the server.",
			});
		}

		let parsedImageUrl;
		try {
			parsedImageUrl = new URL(imageUrl);
		} catch {
			return res
				.status(400)
				.json({ message: "The product image URL is invalid." });
		}

		if (parsedImageUrl.protocol !== "https:") {
			return res
				.status(400)
				.json({ message: "The product image must use HTTPS." });
		}

		const imageResponse = await fetch(parsedImageUrl, {
			signal: AbortSignal.timeout(15000),
		});
		if (!imageResponse.ok) {
			return res
				.status(400)
				.json({ message: "The product image could not be read." });
		}

		const mimeType = imageResponse.headers
			.get("content-type")
			?.split(";")[0];
		if (!mimeType?.startsWith("image/")) {
			return res
				.status(400)
				.json({ message: "The supplied URL is not an image." });
		}

		const imageBytes = Buffer.from(await imageResponse.arrayBuffer());
		if (imageBytes.length > 10 * 1024 * 1024) {
			return res
				.status(400)
				.json({
					message: "The product image must be under 10 MB.",
				});
		}

		const prompt = `You are the catalog merchandiser for Veadya, a premium Indian botanical wellness brand.
Analyze the product image and create commercially sensible product details using:
- Product name: ${title.trim()}
- Seller's short description: ${shortDescription.trim()}

Return a polished 2-3 sentence catalog description without medical claims. Price values must be realistic INR integers, and originalPrice must be greater than price. Use a sensible initial stock quantity. Create a concise uppercase SKU beginning with VEADYA-. Choose exactly one category from Capsule, Juice, or Drop based on the product. Provide 3-6 concise tags and an appropriate pack size. Return accessible six-digit hex colors based on the image; textColor must contrast with bg.`;

		const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
		const geminiResponse = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-goog-api-key": process.env.GEMINI_API_KEY,
				},
				body: JSON.stringify({
					contents: [
						{
							role: "user",
							parts: [
								{ text: prompt },
								{
									inlineData: {
										mimeType,
										data: imageBytes.toString(
											"base64",
										),
									},
								},
							],
						},
					],
					generationConfig: {
						responseMimeType: "application/json",
						responseSchema,
						temperature: 0.35,
					},
				}),
				signal: AbortSignal.timeout(45000),
			},
		);

		const geminiData = await geminiResponse.json();
		if (!geminiResponse.ok) {
			console.error(
				"Gemini product generation failed:",
				geminiData?.error?.message,
			);
			return res.status(502).json({
				message:
					geminiData?.error?.message ||
					"Gemini could not generate product details.",
			});
		}

		const resultText = geminiData.candidates?.[0]?.content?.parts
			?.map((part) => part.text || "")
			.join("");
		if (!resultText) {
			return res
				.status(502)
				.json({ message: "Gemini returned an empty response." });
		}

		const generated = JSON.parse(resultText);
		const details = {
			description: String(generated.description || "").trim(),
			price: Math.max(0, Math.round(Number(generated.price) || 0)),
			originalPrice: Math.max(
				0,
				Math.round(Number(generated.originalPrice) || 0),
			),
			stock: Math.max(0, Math.round(Number(generated.stock) || 0)),
			sku: String(generated.sku || "")
				.trim()
				.toUpperCase(),
			categoryName: PRODUCT_CATEGORIES.includes(generated.categoryName)
				? generated.categoryName
				: "Capsule",
			size: String(generated.size || "").trim(),
			tags: Array.isArray(generated.tags)
				? generated.tags
						.map(String)
						.map((tag) => tag.trim())
						.filter(Boolean)
						.slice(0, 6)
				: [],
			bg: isHexColor(generated.bg) ? generated.bg : "#fcfbfa",
			accent: isHexColor(generated.accent)
				? generated.accent
				: "#114232",
			textColor: isHexColor(generated.textColor)
				? generated.textColor
				: "#111111",
			subColor: isHexColor(generated.subColor)
				? generated.subColor
				: "#666666",
		};

		if (details.originalPrice <= details.price) {
			details.originalPrice = Math.ceil(details.price * 1.2);
		}

		return res.status(200).json({
			message: "Product details generated successfully.",
			data: details,
		});
	} catch (error) {
		if (error.name === "TimeoutError") {
			return res
				.status(504)
				.json({
					message: "AI generation timed out. Please try again.",
				});
		}
		next(error);
	}
};
