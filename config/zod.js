import z from "zod";

const assetUrlSchema = z.string().refine(
	(value) => value.startsWith("/") || URL.canParse(value),
	"Invalid asset URL",
);

export const addressSchema = z.object({
	addressLine1: z.string().optional(),
	addressLine2: z.string().optional(),
	line1: z.string().optional(),
	line2: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	pinCode: z
		.string()
		.regex(/^\d{6}$/, "PIN Code must be 6 digits")
		.optional(),
	pincode: z.string().optional(),
	country: z.string().optional(),
	phone: z.string().min(10, "Phone number must have at least 10 digits").optional(),
});

export const registerSchema = z.object({
	name: z.string().min(3, "Name must have more than 2 characters").optional(),
	firstName: z
		.string()
		.min(3, "First Name must have more than 2 characters")
		.optional(),
	lastName: z.string().optional(),
	email: z.string().email("Invalid email address"),
	phone: z.string().min(10, "Phone number must have 10 characters").optional(),
	password: z
		.string()
		.min(6, "Password must have a minimum of 6 characters"),

	confirmPassword: z
		.string()
		.min(6, "Confirm Password must have a minimum of 6 characters"),
	role: z.string().optional(),
	shippingAddress: addressSchema.optional(),
}).refine((data) => data.firstName || data.name, {
	message: "Name is required",
	path: ["name"],
});

export const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z
		.string()
		.min(6, "Password must have a minimum of 6 characters"),
});

const productBaseSchema = z.object({
	id: z.union([z.string(), z.number()]).optional(),
	name: z.string().min(3, "Name must have at least 3 characters").optional(),
	title: z.string().min(3, "Title must have at least 3 characters").optional(),

	slug: z.string().min(1, "Slug must have at least 1 character").optional(),

	description: z.string().optional(),

	price: z
		.number({
			required_error: "Price is required",
		})
		.min(0, "Price cannot be negative"),

	originalPrice: z.number().min(0, "Original price cannot be negative").optional(),

	stock: z.number().min(0, "Stock cannot be negative").optional(),

	sku: z.string().optional(),

	category: z.string().optional(),
	categoryName: z.string().optional(),

	image: z.string().optional(),
	images: z
		.array(
			z.union([
				z.string().min(1, "Image URL is required"),
				z.object({
					url: z.string().min(1, "Image URL is required"),
				}),
			]),
		)
		.optional(),

	size: z.string().optional(),
	notes: z
		.object({
			top: z.array(z.string()).optional(),
			heart: z.array(z.string()).optional(),
			base: z.array(z.string()).optional(),
		})
		.optional(),
	tags: z.array(z.string()).optional(),
	bg: z.string().optional(),
	accent: z.string().optional(),
	textColor: z.string().optional(),
	subColor: z.string().optional(),
	rating: z.number().min(0).max(5).optional(),
	reviews: z.number().min(0).optional(),

	status: z.enum(["draft", "active"]).optional(),
});

export const productSchema = productBaseSchema.refine((data) => data.title || data.name, {
	message: "Product name is required",
	path: ["name"],
});

export const productUpdateSchema = productBaseSchema.partial();

export const categorySchema = z.object({
	name: z.string().min(2, "Category name must have at least 2 characters"),

	slug: z.string().min(2, "Slug must have at least 2 characters"),

	description: z.string().optional(),

	image: assetUrlSchema.optional(),

	parentCategory: z.string().optional(),

	isFeatured: z.boolean().optional(),

	status: z.enum(["active", "inactive"]).optional(),
});

export const createOrderSchema = z.object({
	items: z
		.array(
			z.object({
				product: z.string().min(1, "Product ID is required").optional(),
				frontendId: z.string().optional(),
				id: z.union([z.string(), z.number()]).optional(),
				name: z.string().optional(),
				category: z.string().optional(),
				price: z.number().min(0, "Price cannot be negative").optional(),
				image: z.string().optional(),

				quantity: z.number().min(1, "Quantity must be at least 1"),
				qty: z.number().min(1, "Quantity must be at least 1").optional(),
			}),
		)
		.min(1, "At least one item is required"),

	shippingAddress: z.object({
		name: z.string().optional(),
		phone: z.string().optional(),
		email: z.string().email("Invalid email address").optional(),
		addressLine1: z.string().min(1, "Address Line 1 is required"),
		line1: z.string().optional(),

		addressLine2: z.string().optional(),
		line2: z.string().optional(),

		city: z.string().min(1, "City is required"),

		state: z.string().min(1, "State is required"),

		pinCode: z.string().regex(/^\d{6}$/, "PIN Code must be 6 digits"),
		pincode: z.string().optional(),

		country: z.string().min(1, "Country is required"),
	}).optional(),
	address: z.object({
		name: z.string().optional(),
		phone: z.string().optional(),
		email: z.string().email("Invalid email address").optional(),
		line1: z.string().min(1, "Address Line 1 is required"),
		line2: z.string().optional(),
		city: z.string().min(1, "City is required"),
		state: z.string().min(1, "State is required"),
		pincode: z.string().min(1, "PIN Code is required"),
		country: z.string().min(1, "Country is required"),
	}).optional(),

	paymentMethod: z.enum(["cod", "razorpay"]).optional(),

	razorpayOrderId: z.string().optional(),
	razorpayPaymentId: z.string().optional(),
	razorpaySignature: z.string().optional(),
});

export const reviewSchema = z.object({
	product: z.string(),

	rating: z
		.number({
			required_error: "Rating is required",
		})
		.min(1, "Minimum rating is 1")
		.max(5, "Maximum rating is 5"),

	comment: z.string().min(3, "Comment must have at least 3 characters"),
});

export const contactSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	subject: z.string().min(1, "Subject is required"),
	message: z.string().min(1, "Message is required"),
});

export const consultationSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	goal: z.string().min(1, "Wellness goal is required"),
	notes: z.string().optional(),
});

export const pageSchema = z.object({
	title: z.string().min(3, "Title must have at least 3 characters"),

	slug: z.string().min(3, "Slug must have at least 3 characters"),

	content: z.string().min(1, "Content is required"),

	excerpt: z.string().optional(),

	featuredImage: assetUrlSchema.optional(),

	status: z.enum(["draft", "published"]).optional(),

	seoTitle: z.string().optional(),

	seoDescription: z.string().optional(),

	seoKeywords: z.array(z.string()).optional(),
});

export const postSchema = z.object({
	title: z.string().min(3, "Title must have at least 3 characters"),

	slug: z.string().min(3, "Slug must have at least 3 characters"),

	excerpt: z.string().optional(),

	content: z.string().min(1, "Content is required"),

	featuredImage: assetUrlSchema.optional(),

	status: z.enum(["draft", "published"]).optional(),

	postCategory: z.string().optional(),

	author: z.string().optional(),

	seoTitle: z.string().optional(),

	seoDescription: z.string().optional(),

	seoKeywords: z.array(z.string()).optional(),

	publishedAt: z.string().datetime().optional(),
});

export const postCategorySchema = z.object({
	name: z.string().min(2, "Category name must have at least 2 characters"),

	slug: z.string().min(2, "Slug must have at least 2 characters"),

	description: z.string().optional(),

	status: z.enum(["active", "inactive"]).optional(),
});

export const menuSchema = z.object({
	name: z.string().min(2, "Menu name must have at least 2 characters"),

	location: z.enum(["header", "footer", "mobile"]),

	items: z
		.array(
			z.object({
				label: z.string().min(1, "Label is required"),

				url: z.string().min(1, "URL is required"),

				order: z.number().optional(),

				target: z.enum(["_self", "_blank"]).optional(),
			}),
		)
		.optional(),
});

export const contentTypeSchema = z.object({
	name: z
		.string()
		.min(2, "Content type name must have at least 2 characters"),

	slug: z.string().min(2, "Slug must have at least 2 characters"),

	description: z.string().optional(),

	fields: z
		.array(
			z.object({
				name: z.string().min(1, "Field name is required"),

				label: z.string().min(1, "Field label is required"),

				type: z.enum([
					"text",
					"textarea",
					"number",
					"boolean",
					"date",
					"image",
					"select",
				]),

				required: z.boolean().optional(),

				defaultValue: z.any().optional(),

				options: z.array(z.string()).optional(),
			}),
		)
		.min(1, "At least one field is required"),
});

export const contentEntrySchema = z.object({
	contentType: z.string(),

	data: z.object({}).passthrough(),

	status: z.enum(["draft", "published"]).optional(),
});

export const settingsSchema = z.object({
	siteName: z.string().optional(),

	siteDescription: z.string().optional(),

	logo: assetUrlSchema.optional(),

	favicon: assetUrlSchema.optional(),

	contactEmail: z.string().email("Invalid email").optional(),

	contactPhone: z.string().optional(),

	address: z.string().optional(),

	socialLinks: z
		.object({
			facebook: z.string().url().optional(),

			instagram: z.string().url().optional(),

			twitter: z.string().url().optional(),

			linkedin: z.string().url().optional(),

			youtube: z.string().url().optional(),
		})
		.optional(),
});

export const newsletterSchema = z.object({
	email: z.string().email("Invalid email address"),

	status: z.enum(["active", "unsubscribed"]).optional(),
});

export const couponSchema = z.object({
	code: z.string().min(2, "Coupon code is required"),

	description: z.string().optional(),

	type: z.enum(["percentage", "fixed"]),

	value: z.number().min(0, "Value cannot be negative"),

	minOrderAmount: z.number().min(0).optional(),

	maxDiscount: z.number().min(0).optional(),

	usageLimit: z.number().min(1).optional(),

	usedCount: z.number().min(0).optional(),

	startDate: z.string().optional(),

	expiryDate: z.string().optional(),

	status: z.enum(["active", "inactive"]).optional(),
});

export const bannerSchema = z.object({
	title: z.string().min(2, "Title is required"),

	subtitle: z.string().optional(),

	eyebrow: z.string().optional(),

	image: assetUrlSchema,

	buttonText: z.string().optional(),

	buttonLink: z.string().optional(),

	position: z.enum(["homepage", "category", "sidebar", "popup"]).optional(),

	order: z.number().optional(),

	status: z.enum(["active", "inactive"]).optional(),
});

export const notificationSchema = z.object({
	title: z.string().min(2, "Title is required"),

	message: z.string().min(2, "Message is required"),

	type: z.enum(["system", "order", "promotion", "announcement"]).optional(),

	user: z.string().optional(),

	isRead: z.boolean().optional(),

	status: z.enum(["active", "inactive"]).optional(),
});
