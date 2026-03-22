/**
 * ========================================================================
 * HƯỚNG DẪN REFACTOR BACKEND THEO CLEAN ARCHITECTURE
 * ========================================================================
 * 
 * TỔNG QUAN KIẾN TRÚC:
 * 
 * Request → Route → Controller → Service → DB/Logic
 *                      ↓
 *                 (try-catch)
 *                      ↓
 *              Success: res.success() → Response Handler → JSON
 *              Error: throw error → next(error) → Error Handler → JSON
 * 
 * ========================================================================
 * PHÂN TÍCH TỪNG LỚER:
 * ========================================================================
 * 
 * 1. ROUTE (src/routes/favourite.js)
 * ----
 * - Định nghĩa API endpoints
 * - Gọi controller methods
 * - Ví dụ:
 *   router.delete("/:user_id/clear", clearFavourites);
 * 
 * 2. CONTROLLER (src/controllers/favourite.controller.js)
 * ----
 * Dùng để: Tiếp nhận request, gọi service, trả response
 * 
 * Luồng:
 * - Validate input từ req.params, req.body, req.query
 * - Gọi service (try-catch)
 * - Thành công: res.success(data, message)
 * - Lỗi: next(error) → errorHandler xử lý
 * 
 * Ví dụ:
 *   const clearFavourites = async (req, res, next) => {
 *     try {
 *       const user_id = req.params.user_id;
 *       const favourite = await clearFavouritesService(user_id);
 *       return res.success(favourite, "Xóa thành công");
 *     } catch (error) {
 *       next(error);
 *     }
 *   };
 * 
 * 3. SERVICE (src/services/favourite.service.js)
 * ----
 * Dùng để: Xử lý logic nghiệp vụ, database, validation, return data
 * 
 * Nguyên tắc:
 * - KHÔNG dùng res (không biết có HTTP context không)
 * - KHÔNG return { EC, EM } (response formatting là job của controller)
 * - CHỈ return data hoặc throw ApiError
 * - Có thể được gọi từ nhiều nơi (controller, cron, etc)
 * 
 * Ví dụ:
 *   const clearFavouritesService = async (user_id) => {
 *     const favourite = await Favourite.findByUserId(user_id);
 *     if (!favourite) {
 *       throw new ApiError(404, 4004, "Không tìm thấy");
 *     }
 *     favourite.products = [];
 *     await favourite.save();
 *     return favourite;  // Chỉ return data!
 *   };
 * 
 * 4. UTILS (src/utils/ApiError.js)
 * ----
 * Dùng để: Chuẩn hóa error trong ứng dụng
 * 
 * Ví dụ:
 *   throw new ApiError(404, 4004, "Không tìm thấy dữ liệu");
 *   throw new ApiError(400, 4001, "Input không hợp lệ");
 *   throw new ApiError(500, -1, "Lỗi hệ thống");
 * 
 * 5. MIDDLEWARE (src/middlewares/)
 * ----
 * a) responseHandler.js - Thêm res.success() method
 *    - Chuẩn hóa response thành công
 *    - Gắn vào app trước routes
 * 
 * b) errorHandler.js - Xử lý lỗi
 *    - Bắt error từ next(error)
 *    - Format response lỗi theo chuẩn
 *    - Gắn vào app sau tất cả routes
 * 
 * ========================================================================
 * VÍ DỤ RESPONSE THÀNH CÔNG:
 * ========================================================================
 * 
 * Request: DELETE /api/favourites/1/clear
 * 
 * Response (200 OK):
 * {
 *   "EC": 0,
 *   "EM": "Xóa danh sách yêu thích thành công",
 *   "result": {
 *     "user_id": 1,
 *     "products": [],
 *     "_id": "507f1f77bcf86cd799439011"
 *   }
 * }
 * 
 * Flow:
 * 1. clearFavourites (controller)
 *    - Validate user_id
 *    - Gọi clearFavouritesService(user_id)
 * 
 * 2. clearFavouritesService (service)
 *    - Tìm favourite theo user_id
 *    - Xóa products array
 *    - Save DB
 *    - return favourite
 * 
 * 3. Controller nhận kết quả
 *    - res.success(favourite, "Xóa danh sách yêu thích thành công")
 *    - responseHandler format + gửi JSON
 * 
 * ========================================================================
 * VÍ DỤ RESPONSE LỖI:
 * ========================================================================
 * 
 * Request: DELETE /api/favourites/999/clear
 * (user 999 không tồn tại)
 * 
 * Response (404 Not Found):
 * {
 *   "EC": 4004,
 *   "EM": "Không tìm thấy danh sách yêu thích",
 *   "result": null
 * }
 * 
 * Flow:
 * 1. clearFavourites (controller)
 *    - try { gọi clearFavouritesService(999) }
 * 
 * 2. clearFavouritesService (service)
 *    - Tìm favourite => null
 *    - throw new ApiError(404, 4004, "Không tìm thấy danh sách yêu thích")
 * 
 * 3. Controller catch error
 *    - next(error) → pass cho errorHandler
 * 
 * 4. errorHandler (middleware)
 *    - Detect ApiError instance
 *    - res.status(404).json({ EC: 4004, EM: "...", result: null })
 * 
 * ========================================================================
 * VÍ DỤ GẮN MIDDLEWARE TRONG SERVER.JS:
 * ========================================================================
 * 
 * const express = require("express");
 * const responseHandler = require("./src/middlewares/responseHandler");
 * const errorHandler = require("./src/middlewares/errorHandler");
 * const favouriteRoutes = require("./src/routes/favourite");
 * 
 * const app = express();
 * 
 * // 1. Body parser middleware (xử lý JSON)
 * app.use(express.json());
 * 
 * // 2. RESPONSE HANDLER (phải trước routes để res.success() có sẵn)
 * app.use(responseHandler);
 * 
 * // 3. Routes
 * app.use("/api/favourites", favouriteRoutes);
 * // app.use("/api/users", userRoutes);
 * // app.use("/api/products", productRoutes);
 * 
 * // 4. ERROR HANDLER (phải cuối cùng để catch tất cả error)
 * app.use(errorHandler);
 * 
 * // 5. Start server
 * const PORT = process.env.PORT || 3000;
 * app.listen(PORT, () => {
 *   console.log(`Server running on port ${PORT}`);
 * });
 * 
 * ===== THỨ TỰ QUAN TRỌNG =====
 * 1. express.json() - Parse body
 * 2. responseHandler - Setup res.success()
 * 3. Routes - Xử lý request
 * 4. errorHandler - Xử lý error (phải cuối!)
 * 
 * ========================================================================
 * LUÔN TUÂN THỰ NGUYÊN TẮC 3 TẦNG:
 * ========================================================================
 * 
 * ROUTE → CONTROLLER → SERVICE
 * 
 * Controller:
 * ✓ DỮ LIỆU: req.params, req.body, req.query
 * ✓ RESPONSE: res.success(), next(error)
 * ✓ VALIDATION: Kiểm tra input
 * ✗ LOGIC: Không xử lý business logic
 * 
 * Service:
 * ✓ LOGIC: Business logic, database, validation
 * ✓ ERROR: throw new ApiError(...)
 * ✓ RETURN: return data (chỉ data, không response object)
 * ✗ RESPONSE: Không dùng res, không return { EC, EM }
 * ✗ REQUEST: Không dùng req
 * 
 * Route:
 * ✓ ENDPOINT: Định nghĩa URL, HTTP method
 * ✓ CONTROLLER: Gọi controller method
 * ✗ LOGIC: Không có logic
 * 
 * ========================================================================
 * ERROR CODE CONVENTIONS:
 * ========================================================================
 * 
 * EC = 0: Success
 * EC = 4000: Bad Request / Invalid Input
 * EC = 4001: Already Exists / Conflict
 * EC = 4002: Unauthorized
 * EC = 4003: Forbidden
 * EC = 4004: Not Found
 * EC = 5000+: Server Error
 * EC = -1: Unknown System Error
 * 
 * ========================================================================
 * HTTP STATUS CODE vs ERROR CODE (EC):
 * ========================================================================
 * 
 * HTTP Status: Cho HTTP client/browser biết request status (200, 404, 500)
 * Error Code (EC): Cho frontend/app biết lỗi gì (4004 = not found, etc)
 * 
 * Ví dụ:
 * - HTTP 404 + EC 4004 = Not Found (không tìm thấy dữ liệu)
 * - HTTP 400 + EC 4000 = Bad Request (input không hợp lệ)
 * - HTTP 500 + EC -1 = Server Error (lỗi hệ thống)
 * 
 * ========================================================================
 * TESTING ENDPOINTS:
 * ========================================================================
 * 
 * # Get favourites
 * curl http://localhost:3000/api/favourites/1
 * 
 * # Add to favourites
 * curl -X POST http://localhost:3000/api/favourites/1/add \\
 *   -H "Content-Type: application/json" \\
 *   -d '{"product_id": 101}'
 * 
 * # Clear favourites
 * curl -X DELETE http://localhost:3000/api/favourites/1/clear
 * 
 * ========================================================================
 */

console.log("Clean Architecture Documentation - Xem file này để hiểu rõ flow!");
