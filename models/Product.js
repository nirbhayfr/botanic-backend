import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
	{
		url: {
			type: String,
			required: true,
		},
	},
	{ _id: false },
);

const ingredientSchema = new mongoose.Schema(
	{
		name: String,
		amount: String,
		benefit: String,
	},
	{ _id: false },
);

const productSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Product title is required"],
			trim: true,
		},

		slug: {
			type: String,
			required: [true, "Slug is required"],
			unique: true,
			lowercase: true,
			trim: true,
		},

		description: {
			type: String,
		},

		longDescription: {
			type: String,
		},

		price: {
			type: Number,
			required: [true, "Price is required"],
			min: [0, "Price cannot be negative"],
		},

		salePrice: {
			type: Number,
			min: [0, "Sale price cannot be negative"],
		},

		stock: {
			type: Number,
			default: 0,
			min: [0, "Stock cannot be negative"],
		},

		sku: {
			type: String,
			unique: true,
			sparse: true,
		},

		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
		},

		categoryName: {
			type: String,
			trim: true,
		},

		concern: {
			type: String,
			trim: true,
		},

		images: [productImageSchema],

		badge: String,
		priceLabel: String,
		tagline: String,
		quantity: String,
		dosage: String,
		ingredients: [ingredientSchema],
		benefits: [String],
		suitableFor: String,
		certifications: [String],
		relatedIds: [String],

		isFeatured: {
			type: Boolean,
			default: false,
		},

		status: {
			type: String,
			enum: ["draft", "active"],
			default: "active",
		},

		ratingAverage: {
			type: Number,
			default: 0,
		},

		ratingCount: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
