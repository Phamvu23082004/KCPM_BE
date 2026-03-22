/**
 * Favourite Controller
 * Dùng để: Tiếp nhận request, gọi service, format response, handle error
 * 
 * Best practice controller flow:
 * 1. Validate input từ req.body, req.params
 * 2. Dùng try-catch khi gọi service
 * 3. Nếu success => res.success(data, message)
 * 4. Nếu error => next(error) (để errorHandler xử lý)
 * 
 * Lý do dùng try-catch + next(error):
 * - Service throw ApiError, controller catch
 * - next(error) pass lỗi đến errorHandler middleware
 * - errorHandler format response theo chuẩn
 * 
 * Cấu trúc:
 * - req.params: URL parameters (/:id)
 * - req.query: Query parameters (?key=value)
 * - req.body: Request body data
 * - res.success(): Gửi response success (added by responseHandler middleware)
 * - next(error): Pass error đến error handling middleware
 */

const {
  clearFavouritesService,
  getFavouritesService,
  addToFavouritesService
} = require("../services/favourite.service");


/**
 * Clear danh sách yêu thích
 * Route: DELETE /api/favourites/clear
 * URL params: user_id
 */
const clearFavourites = async (req, res, next) => {
  try {
    // 1. Extract params
    const user_id = req.params.user_id || req.body.user_id;
    
    // 2. Validate
    if (!user_id) {
      const error = new Error("user_id là bắt buộc");
      error.statusCode = 400;
      error.errorCode = 4000;
      throw error;
    }
    
    // 3. Gọi service (service xử lý logic, có thể throw error)
    const favourite = await clearFavouritesService(user_id);
    
    // 4. Success => res.success() chuẩn hóa response
    return res.success(
      favourite,
      "Xóa danh sách yêu thích thành công",
      200
    );
    
  } catch (error) {
    // 5. Error => next(error) => errorHandler middleware
    logger.error(`clearFavourites error: ${error.message}`);
    next(error);
  }
};

/**
 * Get danh sách yêu thích
 * Route: GET /api/favourites/:user_id
 */
const getFavourites = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    
    if (!user_id) {
      const error = new Error("user_id là bắt buộc");
      error.statusCode = 400;
      error.errorCode = 4000;
      throw error;
    }
    
    const favourite = await getFavouritesService(user_id);
    
    return res.success(favourite, "Lấy danh sách yêu thích thành công");
    
  } catch (error) {
    next(error);
  }
};

/**
 * Thêm product vào yêu thích
 * Route: POST /api/favourites/:user_id/add
 */
const addToFavourites = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const { product_id } = req.body;
    
    // Validate
    if (!user_id || !product_id) {
      const error = new Error("user_id và product_id là bắt buộc");
      error.statusCode = 400;
      error.errorCode = 4000;
      throw error;
    }
    
    const favourite = await addToFavouritesService(user_id, product_id);
    
    return res.success(
      favourite,
      "Thêm vào danh sách yêu thích thành công",
      201
    );
    
  } catch (error) {
    logger.error(`addToFavourites error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  clearFavourites,
  getFavourites,
  addToFavourites
};
