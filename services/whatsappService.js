
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || "v21.0";

const normalizePhoneNumber = (value) => {
	const digits = String(value || "").replace(/\D/g, "");
	if (!digits) return "";
	if (digits.length === 10) {
		return `${process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "91"}${digits}`;
	}
	return digits;
};

export const hasWhatsAppCredentials = () =>
	Boolean(
		process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN,
	);

export const sendTemplateMessage = async ({
	to,
	templateName,
	languageCode = "en",
	parameters = [],
}) => {
	if (!hasWhatsAppCredentials()) {
		throw new Error("WhatsApp credentials are missing");
	}

	const normalizedRecipient = normalizePhoneNumber(to);
	if (!normalizedRecipient) {
		throw new Error("A valid WhatsApp recipient number is required");
	}

	const response = await fetch(
		`https://graph.facebook.com/${WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				messaging_product: "whatsapp",
				to: normalizedRecipient,
				type: "template",
				template: {
					name: templateName,
					language: {
						code: languageCode,
					},
					components:
						parameters.length > 0
							? [
									{
										type: "body",
										parameters: parameters.map((value) => ({
											type: "text",
											text: String(value ?? ""),
										})),
									},
								]
							: undefined,
				},
			}),
		},
	);

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(
			data.error?.message || data.message || "WhatsApp send failed",
		);
	}

	return data.messages?.[0]?.id || "";
};
