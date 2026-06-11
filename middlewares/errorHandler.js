const tryCatch = (handler) => {
	return async (req, res, next) => {
		try {
			await handler(req, res, next);
		} catch (error) {
			if (!res.headersSent) {
				res.status(500).json({
					message: error.message,
				});
			}
		}
	};
};

export default tryCatch;
