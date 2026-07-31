import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async ({ to, subject, html }) => {
	if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
		console.warn(
			"Email skipped: RESEND_API_KEY and EMAIL_FROM must be configured.",
		);
		return { skipped: true };
	}

	const resend = new Resend(process.env.RESEND_API_KEY);
	const result = await resend.emails.send({
		from: process.env.EMAIL_FROM,
		to,
		subject,
		html,
	});

	return { ...result, skipped: false };
};
