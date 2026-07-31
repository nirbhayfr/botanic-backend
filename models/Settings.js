import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
	{
		siteName: {
			type: String,
			trim: true,
		},

		siteDescription: {
			type: String,
		},

		logo: {
			type: String,
		},

		favicon: {
			type: String,
		},

		contactEmail: {
			type: String,
			lowercase: true,
			trim: true,
		},

		contactPhone: {
			type: String,
			trim: true,
		},

		address: {
			type: String,
		},

		socialLinks: {
			facebook: String,
			instagram: String,
			twitter: String,
			linkedin: String,
			youtube: String,
		},
	},
	{ timestamps: true },
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;

