/**
 * ApiError class - Custom error class cho API
 * Dùng để standardize lỗi trong service layer
 * Mục đích: Tách biệt logic xử lý lỗi khỏi response formatting
 * 
 * Cách dùng:
 * - Trong service: throw new ApiError(404, 4004, "Không tìm thấy dữ liệu")
 * - errorHandler middleware sẽ bắt và format response theo chuẩn
 */

class ApiError extends Error {
  constructor(statusCode = 500, errorCode = -1, message = "Lỗi hệ thống") {
    super(message);
    this.statusCode = statusCode;     // HTTP status code (200, 400, 404, 500, etc.)
    this.errorCode = errorCode;       // EC code trong response (0, 4004, 400, etc.)
    this.name = "ApiError";
    
    // Capture stack trace (Node.js specific)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
