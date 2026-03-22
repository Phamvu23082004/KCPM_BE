/**
 * ═════════════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE BACKEND - HƯỚNG DẪN CHI TIẾT
 * ═════════════════════════════════════════════════════════════════════════
 * 
 * Dự án: KCPM Backend
 * Pattern: Clean Architecture (Controller - Service - Middleware - Utils)
 * Framework: Express.js
 * Module System: CommonJS (require/module.exports)
 * 
 * ═════════════════════════════════════════════════════════════════════════
 * PHẦN 1: CẤU TRÚC FILE
 * ═════════════════════════════════════════════════════════════════════════
 * 
 * KCPM/
 * ├── server.js                          # Entry point
 * ├── package.json
 * └── src/
 *     ├── ARCHITECTURE.js                # (FILE NÀY) Documentation
 *     ├── config/
 *     │   └── db.js
 *     ├── middlewares/
 *     │   ├── responseHandler.js         # ✓ Chuẩn hóa response thành công
 *     │   └── errorHandler.js            # ✓ Xử lý lỗi
 *     ├── controllers/
 *     │   └── favourite.controller.js    # ✓ Tiếp nhận request
 *     ├── services/
 *     │   └── favourite.service.js       # ✓ Xử lý logic
 *     ├── routes/
 *     │   ├── index.js                   # ✓ Gộp tất cả routes
 *     │   ├── health.js
 *     │   └── favourite.js               # ✓ Route mẫu
 *     └── utils/
 *         ├── logger.js
 *         └── ApiError.js                # ✓ Custom error class
 * 
 * ═════════════════════════════════════════════════════════════════════════
 * PHẦN 2: TỰ ĐỘNG NẮM CẮT CHI TIẾT - CLEAN ARCHITECTURE
 * ═════════════════════════════════════════════════════════════════════════
 * 
 * ▶️ SERVICE FLOW (Xử lý logic)
 * ──────────────────────────────────────────────────────────────────────
 * 
 *     clearFavouritesService(user_id)
 *     ↓
 *     try {
 *       1. const favourite = await Favourite.findByUserId(user_id)
 *       2. if (!favourite) throw new ApiError(404, 4004, "Không tìm thấy")
 *       3. favourite.products = []
 *       4. await favourite.save()
 *       5. return favourite  ← CHỈ RETURN DATA, KHÔNG RETURN { EC, EM }
 *     } catch (error) {
 *       if (error instanceof ApiError) throw error
 *       throw new ApiError(500, -1, "Lỗi hệ thống")
 *     }
 * 
 * Nguyên tắc:
 * - Nhận input (user_id, product_id, etc)
 * - Dùng try-catch để handle error
 * - throw new ApiError(...) khi có lỗi
 * - return data (chỉ data, không response object)
 * - KHÔNG dùng res
 * - KHÔNG return { EC, EM }
 * 
 * ──────────────────────────────────────────────────────────────────────
 * ▶️ CONTROLLER FLOW (Tiếp nhận request)
 * ──────────────────────────────────────────────────────────────────────
 * 
 *     clearFavourites(req, res, next)
 *     ↓
 *     try {
 *       1. const user_id = req.params.user_id
 *       2. if (!user_id) throw new Error("user_id là bắt buộc")
 *       3. const favourite = await clearFavouritesService(user_id)
 *       4. return res.success(favourite, "Xóa thành công")
 *                    ↓
 *            responseHandler format:
 *            {
 *              EC: 0,
 *              EM: "Xóa thành công",
 *              result: { ... }
 *            }
 *     } catch (error) {
 *       next(error)  ← Pass lỗi đến errorHandler
 *               ↓
 *       errorHandler {
 *         - Check nếu ApiError
 *         - res.status(statusCode).json({ EC, EM, result: null })
 *       }
 *     }
 * 
 * Nguyên tắc:
 * - Validate input từ req
 * - Gọi service (try-catch)
 * - Thành công: res.success(data, message)
 * - Lỗi: next(error)
 * - KHÔNG xử lý business logic (chỉ validate + call service)
 * 
 * ──────────────────────────────────────────────────────────────────────
 * ▶️ ROUTE FLOW
 * ──────────────────────────────────────────────────────────────────────
 * 
 *     router.delete("/:user_id/clear", clearFavourites)
 *                   ↓
 *     DELETE /api/favourites/1/clear
 *                   ↓
 *     clearFavourites(req, res, next)
 * 
 * Nguyên tắc:
 * - Định nghĩa endpoint
 * - Gọi controller handler
 * - KHÔNG có logic
 * 
 * ──────────────────────────────────────────────────────────────────────
 * ▶️ MIDDLEWARE FLOW
 * ──────────────────────────────────────────────────────────────────────
 * 
 *     app.use(express.json)
 *     ↓
 *     app.use(responseHandler)  ← Thêm res.success() method
 *     ↓
 *     app.use('/api', routes)
 *     ↓ (nếu có error)
 *     app.use(errorHandler)     ← Xử lý lỗi
 * 
 * ═════════════════════════════════════════════════════════════════════════
 * PHẦN 3: VÍ DỤ RESPONSE THÀNH CÔNG
 * ═════════════════════════════════════════════════════════════════════════
 * 
 * ▶️ Request:
 * DELETE /api/favourites/1/clear
 * 
 * ▶️ Response (200 OK):
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
 * ▶️ Flow:
 * 1. Route nhận DELETE /api/favourites/1/clear
 * 2. Gọi clearFavourites(req, res, next)
 * 3. Controller validate user_id = 1
 * 4. Controller gọi clearFavouritesService(1)
 * 5. Service tìm favourite, xóa products[], save DB, return favourite
 * 6. Controller nhận favourite, gọi res.success(favourite, "...")
 * 7. responseHandler format { EC: 0, EM: "...", result: favourite }
 * 8. Client nhận response với HTTP 200
 * 
 * ═════════════════════════════════════════════════════════════════════════
 * PHẦN 4: VÍ DỤ RESPONSE LỖI
 * ═════════════════════════════════════════════════════════════════════════
 * 
 * ▶️ Request:
 * DELETE /api/favourites/999/clear
 * (user 999 không tồn tại)
 * 
 * ▶️ Response (404 Not Found):
 * {
 *   "EC": 4004,
 *   "EM": "Không tìm thấy danh sách yêu thích",
 *   "result": null
 * }
 * 
 * ▶️ Flow:
 * 1. Route nhận DELETE /api/favourites/999/clear
 * 2. Gọi clearFavourites(req, res, next)
 * 3. Controller try { gọi clearFavouritesService(999) }
 * 4. Service tìm favourite => null
 * 5. Service throw new ApiError(404, 4004, "Không tìm thấy...")
 * 6. Controller catch error, gọi next(error)
 * 7. errorHandler middleware bắt error
 * 8. errorHandler detect ApiError instance
 * 9. errorHandler res.status(404).json({ EC: 4004, EM: "...", result: null })
 * 10. Client nhận response với HTTP 404
 * 
 * ▶️ Ví dụ lỗi khác:
 * 
 * Lỗi validation input:
 * {
 *   "EC": 4000,
 *   "EM": "user_id là bắt buộc",
 *   "result": null
 * }
 * HTTP Status: 400
 * 
 * Lỗi hệ thống (DB error):
 * {
 *   "EC": -1,
 *   "EM": "Lỗi hệ thống",
 *   "result": null
 * }
 * HTTP Status: 500
 * 
 * ═════════════════════════════════════════════════════════════════════════
 * PHẦN 5: CÁC FILE CHI TIẾT
 * ═════════════════════════════════════════════════════════════════════════
 * 
 * ▶️ src/utils/ApiError.js
 * ────────────────────────
 * 
 * class ApiError extends Error {
 *   constructor(statusCode = 500, errorCode = -1, message = "Lỗi hệ thống") {
 *     super(message);
 *     this.statusCode = statusCode;  // HTTP 400, 404, 500, etc.
 *     this.errorCode = errorCode;    // EC trong response (4000, 4004, etc.)
 *     this.name = "ApiError";
 *     Error.captureStackTrace(this, this.constructor);
 *   }
 * }
 * 
 * Dùng để:
 * - Standardize error format
 * - Chứa cả HTTP status + error code
 * - Service throw error, controller/errorHandler catch
 * 
 * Cách dùng:
 * - throw new ApiError(404, 4004, "Không tìm thấy")
 * - throw new ApiError(400, 4000, "Input không hợp lệ")
 * - throw new ApiError(500, -1, "Lỗi hệ thống")
 * 
 * ▶️ src/middlewares/responseHandler.js
 * ───────────────────────────────────────
 * 
 * const responseHandler = (req, res, next) => {
 *   res.success = (result = null, message = "Success", status = 200) => {
 *     return res.status(status).json({
 *       EC: 0,
 *       EM: message,
 *       result: result
 *     });
 *   };
 *   next();
 * };
 * 
 * Dùng để:
 * - Thêm res.success() method vào res object
 * - Chuẩn hóa response thành công
 * - Chỉ Controller dùng
 * 
 * Lý do không dùng trong Service:
 * - res là HTTP object, Service không lúc nào cũng có res
 * - Service có thể được gọi từ cron job, event listener, etc
 * - Response formatting là job của Controller, không Service
 * 
 * Gắn vào server.js:
 * app.use(express.json());
 * app.use(responseHandler);  ← TRƯỚC routes
 * app.use('/api', routes);
 * 
 * ▶️ src/middlewares/errorHandler.js
 * ──────────────────────────────────
 * 
 * const errorHandler = (err, req, res, next) => {
 *   logger.error("Error:", { message, statusCode, errorCode, stack });
 * 
 *   if (err instanceof ApiError) {
 *     return res.status(err.statusCode).json({
 *       EC: err.errorCode,
 *       EM: err.message,
 *       result: null
 *     });
 *   }
 * 
 *   return res.status(err.statusCode || 500).json({
 *     EC: err.errorCode || -1,
 *     EM: err.message || "Lỗi hệ thống",
 *     result: null
 *   });
 * };
 * 
 * Dùng để:
 * - Bắt tất cả lỗi từ next(error)
 * - Chuẩn hóa response lỗi
 * - Log error để debug
 * 
 * Gắn vào server.js:
 * app.use('/api', routes);
 * app.use(errorHandler);  ← CUỐI CÙNG, sau tất cả routes
 * 
 * ▶️ src/services/favourite.service.js
 * ────────────────────────────────────
 * 
 * const clearFavouritesService = async (user_id) => {
 *   try {
 *     const favourite = await Favourite.findByUserId(user_id);
 *     if (!favourite) {
 *       throw new ApiError(404, 4004, "Không tìm thấy danh sách yêu thích");
 *     }
 *     favourite.products = [];
 *     await favourite.save();
 *     return favourite;  // ← Chỉ return data
 *   } catch (error) {
 *     if (error instanceof ApiError) throw error;
 *     throw new ApiError(500, -1, "Lỗi hệ thống");
 *   }
 * };
 * 
 * Quy tắc:
 * 1. Nhận parameter (user_id, product_id, etc)
 * 2. Dùng try-catch
 * 3. Tương tác DB, xử lý logic
 * 4. throw ApiError nếu có lỗi
 * 5. return data (không return { EC, EM })
 * 6. KHÔNG dùng res
 * 7. KHÔNG log response
 * 
 * ▶️ src/controllers/favourite.controller.js
 * ──────────────────────────────────────────
 * 
 * const clearFavourites = async (req, res, next) => {
 *   try {
 *     const user_id = req.params.user_id;
 *     if (!user_id) {
 *       const error = new Error("user_id là bắt buộc");
 *       error.statusCode = 400;
 *       error.errorCode = 4000;
 *       throw error;
 *     }
 *     const favourite = await clearFavouritesService(user_id);
 *     return res.success(favourite, "Xóa danh sách yêu thích thành công");
 *   } catch (error) {
 *     next(error);  // ← Pass lỗi đến errorHandler
 *   }
 * };
 * 
 * Quy tắc:
 * 1. Validate input từ req
 * 2. try { gọi service }
 * 3. Nếu success: res.success(data, message)
 * 4. Nếu error: next(error)
 * 5. KHÔNG xử lý business logic
 * 6. KHÔNG tương tác DB trực tiếp
 * 
 * ▶️ src/routes/favourite.js
 * ─────────────────────────
 * 
 * const express = require("express");
 * const router = express.Router();
 * const { clearFavourites, ... } = require("../controllers/favourite.controller");
 * 
 * router.get("/:user_id", getFavourites);
 * router.post("/:user_id/add", addToFavourites);
 * router.delete("/:user_id/clear", clearFavourites);
 * 
 * module.exports = router;
 * 
 * Quy tắc:
 * 1. Định nghĩa endpoint
 * 2. Gọi controller handler
 * 3. KHÔNG có logic
 * 
 * ═════════════════════════════════════════════════════════════════════════
 * PHẦN 6: GẮN MIDDLEWARE TRONG SERVER.JS
 * ═════════════════════════════════════════════════════════════════════════
 * 
 * ▶️ server.js - STRUCTURE ĐÚNG:
 * 
 * require('dotenv').config();
 * const express = require('express');
 * const cors = require('cors');
 * const connectDB = require('./src/config/db');
 * const responseHandler = require('./src/middlewares/responseHandler');
 * const errorHandler = require('./src/middlewares/errorHandler');
 * const routes = require('./src/routes');
 * 
 * const app = express();
 * 
 * // 1️⃣ BODY PARSER MIDDLEWARE
 * app.use(cors());
 * app.use(express.json());
 * app.use(express.urlencoded({ extended: true }));
 * 
 * // 2️⃣ RESPONSE HANDLER (trước routes!)
 * app.use(responseHandler);
 * 
 * // 3️⃣ DATABASE
 * connectDB();
 * 
 * // 4️⃣ ROUTES
 * app.use('/api', routes);
 * 
 * // 5️⃣ HEALTH CHECK
 * app.get('/', (req, res) => {
 *   res.json({ message: 'Backend API' });
 * });
 * 
 * // 6️⃣ ERROR HANDLER (cuối cùng!)
 * app.use(errorHandler);
 * 
 * // 7️⃣ START SERVER
 * const PORT = process.env.PORT || 5000;
 * app.listen(PORT, () => {
 *   console.log(`Server running on port ${PORT}`);
 * });
 * 
 * ▶️ THỨ TỰ QUAN TRỌNG:
 * 
 * ❌ SAI:
 * app.use(errorHandler);      ← Cuối cùng (request không đi qua)
 * app.use('/api', routes);    ← Cuối (không match)
 * app.use(responseHandler);
 * 
 * ✓ ĐÚNG:
 * app.use(express.json());    ← Parse body
 * app.use(responseHandler);   ← Thêm res.success()
 * app.use('/api', routes);    ← Match route + process
 * app.use(errorHandler);      ← Catch error cuối cùng
 * 
 * ═════════════════════════════════════════════════════════════════════════
 * PHẦN 7: ERROR CODE CONVENTIONS
 * ═════════════════════════════════════════════════════════════════════════
 * 
 * EC = 0      → Success
 * EC = 4000   → Bad Request / Invalid Input
 * EC = 4001   → Already Exists / Conflict
 * EC = 4002   → Unauthorized / Not Authenticated
 * EC = 4003   → Forbidden / No Permission
 * EC = 4004   → Not Found / Resource Not Found
 * EC = 4009   → Conflict / Resource Conflict
 * EC = 5000+  → Server Error
 * EC = -1     → Unknown System Error
 * 
 * ═════════════════════════════════════════════════════════════════════════
 * PHẦN 8: TESTING ENDPOINTS (curl)
 * ═════════════════════════════════════════════════════════════════════════
 * 
 * # Get danh sách yêu thích
 * curl http://localhost:5000/api/favourites/1
 * 
 * # Add sản phẩm vào yêu thích
 * curl -X POST http://localhost:5000/api/favourites/1/add \
 *   -H "Content-Type: application/json" \
 *   -d '{"product_id": 101}'
 * 
 * # Clear danh sách yêu thích
 * curl -X DELETE http://localhost:5000/api/favourites/1/clear
 * 
 * # Response success:
 * {
 *   "EC": 0,
 *   "EM": "Xóa danh sách yêu thích thành công",
 *   "result": { "user_id": 1, "products": [] }
 * }
 * 
 * # Response error (user không tồn tại):
 * {
 *   "EC": 4004,
 *   "EM": "Không tìm thấy danh sách yêu thích",
 *   "result": null
 * }
 * 
 * ═════════════════════════════════════════════════════════════════════════
 * PHẦN 9: QUICK CHECKLIST
 * ═════════════════════════════════════════════════════════════════════════
 * 
 * CONTROLLER ✓:
 * ☐ Validate input từ req.body, req.params, req.query
 * ☐ try-catch khi gọi service
 * ☐ res.success(data, message) nếu success
 * ☐ next(error) nếu error
 * ☐ KHÔNG có business logic
 * 
 * SERVICE ✓:
 * ☐ Nhận parameter (không req)
 * ☐ try-catch để handle error
 * ☐ throw new ApiError(...) khi có lỗi
 * ☐ return data (chỉ data, không { EC, EM })
 * ☐ KHÔNG dùng res
 * ☐ KHÔNG return response object
 * 
 * ROUTE ✓:
 * ☐ Định nghĩa endpoint
 * ☐ Gọi controller handler
 * ☐ KHÔNG có logic
 * 
 * MIDDLEWARE ✓:
 * ☐ responseHandler trước routes
 * ☐ errorHandler sau routes
 * ☐ Dùng req, res, next đúng cách
 * 
 * ═════════════════════════════════════════════════════════════════════════
 * PHẦN 10: BEST PRACTICES KHÁC
 * ═════════════════════════════════════════════════════════════════════════
 * 
 * 1. Dùng logger (utils/logger.js) để log error, info
 *    ✓ logger.error("Error:", { message, stack })
 *    ✗ console.error("error")
 * 
 * 2. Validate input ở controller, xử lý logic ở service
 *    ✓ Controller: if (!user_id) throw error
 *    ✗ Service: if (!user_id) throw error
 * 
 * 3. Dùng meaningful error message
 *    ✓ "Không tìm thấy danh sách yêu thích"
 *    ✗ "Error"
 * 
 * 4. Dùng consistent error code (error.errorCode)
 *    ✓ throw new ApiError(404, 4004, "...")
 *    ✗ throw new Error("...")
 * 
 * 5. Return data simplicity
 *    ✓ return { user_id, products, _id }
 *    ✗ return { EC: 0, EM: "success", result: { ... } }
 * 
 * 6. Service có thể được dùng từ nhiều nơi
 *    ✓ Controller gọi, Cron job gọi, Event listener gọi
 *    ✗ Service response format cụ thể cho HTTP
 * 
 * ═════════════════════════════════════════════════════════════════════════
 * TÓM TẮT
 * ═════════════════════════════════════════════════════════════════════════
 * 
 * REQUEST
 *    ↓
 * ROUTE (định nghĩa endpoint)
 *    ↓
 * CONTROLLER (tiếp nhận, validate, gọi service, format response)
 *    ↓
 * SERVICE (xử lý logic, return data hoặc throw error)
 *    ↓
 * SUCCESS: res.success() → responseHandler → { EC: 0, ... }
 * ERROR: throw error → next(error) → errorHandler → { EC: -1, ... }
 * 
 * Server.js:
 * app.use(express.json());
 * app.use(responseHandler);  ← Thêm res.success()
 * app.use('/api', routes);
 * app.use(errorHandler);     ← Bắt error
 * 
 * ═════════════════════════════════════════════════════════════════════════
 */

console.log("✓ Clean Architecture implemented!");
console.log("✓ Run: npm install");
console.log("✓ Run: npm start");
console.log("✓ Test: curl http://localhost:5000/api/favourites/1");
