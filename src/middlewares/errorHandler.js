/**
 * Error Handler Middleware
 * Dùng để: Bắt tất cả lỗi từ controller/service và format response lỗi thống nhất
 * 
 * Luồng lỗi:
 * 1. Service throw new ApiError(statusCode, errorCode, message)
 * 2. Controller catch error và gọi next(error)
 * 3. errorHandler bắt error, format response, gửi cho client
 * 
 * Response format lỗi:
 * {
 *   "EC": <error_code>,
 *   "EM": "<error_message>",
 *   "result": null
 * }
 */

const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  // Log lỗi để debug
  logger.error("Error:", {
    message: err.message,
    statusCode: err.statusCode,
    errorCode: err.errorCode,
    stack: err.stack
  });

  // Nếu là ApiError, dùng errorCode và message của nó
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      EC: err.errorCode,
      EM: err.message,
      result: null
    });
  }

  // Nếu là lỗi khác (không phải ApiError), trả lỗi hệ thống
  return res.status(err.statusCode || 500).json({
    EC: err.errorCode || -1,
    EM: err.message || "Lỗi hệ thống",
    result: null
  });
};

module.exports = errorHandler;
