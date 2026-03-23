const ApiError = require("../utils/ApiError");
const { logger } = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(
    JSON.stringify({
      message: err.message,
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      stack: err.stack,
    })
  );

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      EC: err.errorCode,
      EM: err.message,
      result: null,
    });
  }

  return res.status(err.statusCode || 500).json({
    EC: err.errorCode || -1,
    EM: err.message || "Lỗi hệ thống",
    result: null,
  });
};

module.exports = errorHandler;