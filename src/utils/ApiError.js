class ApiError extends Error {
  constructor(statusCode = 500, errorCode = -1, message = "Lỗi hệ thống") {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.name = "ApiError";
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
