const { validationResult } = require("express-validator");
const validarCampos = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors });
	}
	next();
};

//class AppError extends Error {
//	constructor(message, statusCode) {
//		super(message);
//		this.statusCode = statusCode;
//		this.isOperational = true;
//		Error.captureStackTrace(this, this.constructor);
//	}
//}

module.exports = { validarCampos };
