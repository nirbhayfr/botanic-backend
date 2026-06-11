import z from "zod";

export const normalizeIndianPhone = (value) => {
	const digits = String(value || "").replace(/\D/g, "");
	if (digits.length === 10) return `91${digits}`;
	if (digits.length === 12 && digits.startsWith("91")) return digits;
	if (digits.length === 13 && digits.startsWith("091")) return digits.slice(1);
	return digits;
};

export const indianPhoneSchema = z
	.string()
	.transform(normalizeIndianPhone)
	.refine(
		(value) => /^91[6-9]\d{9}$/.test(value),
		"Phone must be a valid 10-digit Indian mobile number",
	);

export const addressSchema = z.object({
	addressLine1: z.string().optional(),
	addressLine2: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	pinCode: z
		.string()
		.regex(/^\d{6}$/, "PIN Code must be 6 digits")
		.optional(),
	country: z.string().optional(),
});

export const registerSchema = z.object({
	firstName: z
		.string()
		.min(3, "First Name must have more than 2 characters"),
	lastName: z.string().optional(),
	email: z.string().email("Invalid email address"),
	phone: z.string().min(10, "Phone number must have 10 characters"),
	password: z
		.string()
		.min(8, "Password must have a minimum of 8 characters")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[0-9]/, "Password must contain at least one number")
		.regex(
			/[^A-Za-z0-9]/,
			"Password must contain at least one special character",
		),

	confirmPassword: z
		.string()
		.min(8, "Confirm Password must have a minimum of 8 characters"),
	shippingAddress: addressSchema.optional(),
});

export const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z
		.string()
		.min(8, "Password must have a minimum of 8 characters"),
});

export const productSchema = z.object({
	title: z.string().min(3, "Title must have at least 3 characters"),

	slug: z.string().min(3, "Slug must have at least 3 characters"),

	description: z.string().optional(),
	longDescription: z.string().optional(),

	price: z
		.number({
			required_error: "Price is required",
		})
		.min(0, "Price cannot be negative"),

	salePrice: z.number().min(0, "Sale price cannot be negative").optional(),

	stock: z.number().min(0, "Stock cannot be negative").optional(),

	sku: z.string().optional(),

	category: z.string().optional(),
	categoryName: z.string().optional(),
	concern: z.string().optional(),

	images: z
		.array(
			z.object({
				url: z.string().min(1, "Image URL is required"),
			}),
		)
		.optional(),

	badge: z.string().optional(),
	priceLabel: z.string().optional(),
	tagline: z.string().optional(),
	quantity: z.string().optional(),
	dosage: z.string().optional(),
	ingredients: z
		.array(
			z.object({
				name: z.string().optional(),
				amount: z.string().optional(),
				benefit: z.string().optional(),
			}),
		)
		.optional(),
	benefits: z.array(z.string()).optional(),
	suitableFor: z.string().optional(),
	certifications: z.array(z.string()).optional(),
	relatedIds: z.array(z.string()).optional(),

	isFeatured: z.boolean().optional(),

	status: z.enum(["draft", "active"]).optional(),
});

export const categorySchema = z.object({
	name: z.string().min(2, "Category name must have at least 2 characters"),

	slug: z.string().min(2, "Slug must have at least 2 characters"),

	description: z.string().optional(),

	image: z.string().url("Invalid image URL").optional(),

	parentCategory: z.string().optional(),

	isFeatured: z.boolean().optional(),

	status: z.enum(["active", "inactive"]).optional(),
});

export const createOrderSchema = z.object({
	items: z
		.array(
			z.object({
				product: z.string().min(1, "Product ID is required"),

				quantity: z.number().min(1, "Quantity must be at least 1"),
			}),
		)
		.min(1, "At least one item is required"),

	shippingAddress: z.object({
		addressLine1: z.string().min(1, "Address Line 1 is required"),

		addressLine2: z.string().optional(),

		city: z.string().min(1, "City is required"),

		state: z.string().min(1, "State is required"),

		pinCode: z.string().regex(/^\d{6}$/, "PIN Code must be 6 digits"),

		country: z.string().min(1, "Country is required"),
	}),

	contactPhone: indianPhoneSchema,

	contactEmail: z.string().email("Invalid contact email").optional(),

	customerName: z.string().min(1, "Customer name is required").optional(),

	paymentMethod: z.enum(["cod", "razorpay", "stripe"]).optional(),

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

export const consultationSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	goal: z.string().min(1, "Wellness goal is required"),
	notes: z.string().optional(),
});
