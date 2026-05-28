/**
 * Normalizes a time string to 12-hour format (hh:mm AM/PM)
 * @param {string} time - Time string (HH:mm or already 12h)
 * @returns {string} Normalized time string
 */
export const normalizeTo12Hour = (time) => {
	if (!time || typeof time !== "string") return time;

	// If already has AM/PM, just trim and return
	if (time.toLowerCase().includes("am") || time.toLowerCase().includes("pm")) {
		return time.trim();
	}

	// If it's HH:mm (24-hour)
	if (time.includes(":")) {
		const [hours, minutes] = time.split(":");
		let h = parseInt(hours, 10);
		if (isNaN(h)) return time;
		
		const ampm = h >= 12 ? "PM" : "AM";
		h = h % 12;
		h = h ? h : 12; // the hour '0' should be '12'
		
		return `${h.toString().padStart(2, "0")}:${minutes.substring(0, 2)} ${ampm}`;
	}

	return time;
};
