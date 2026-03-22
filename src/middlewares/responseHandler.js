/**
 * Response Handler Middleware
 * Dùng để: Thêm method res.success() giúp chuẩn hóa response thành công
 * 
 * Lý do chỉ có res.success ở middleware này:
 * - res.success() là HTTP response object property, chỉ có trong response phase
 * - Service chỉ xử lý logic nghiệp vụ, không biết về HTTP status hay response format
 * - Controller nắm request/response, nó quyết định response format
 * - Middleware này attach method vào res object, chỉ Controller dùng
 * 
 * Cách dùng trong controller:
 * res.success(favourite, "Xóa danh sách yêu thích thành công")
 * 
 * Response format:
 * {
 *   "EC": 0,
 *   "EM": "Xóa danh sách yêu thích thành công",
 *   "result": { ... }
 * }
 */

const responseHandler = (req, res, next) => {
  /**
   * res.success(result, message, status)
   * @param {*} result - Dữ liệu trả về (data, object, array, etc.)
   * @param {string} message - Thông báo success (default: "Success")
   * @param {number} status - HTTP status code (default: 200)
   */
  res.success = (result = null, message = "Success", status = 200) => {
    return res.status(status).json({
      EC: 0,           // Error Code - 0 = success
      EM: message,     // Error Message
      result: result   // Dữ liệu
    });
  };

  next();
};

module.exports = responseHandler;
