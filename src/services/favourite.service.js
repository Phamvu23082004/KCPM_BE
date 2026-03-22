/**
 * Favourite Service
 * Dùng để: Xử lý logic nghiệp vụ của favourite (database, validation, business logic)
 * 
 * Lý do service không dùng res, không return { EC, EM }:
 * - Service chỉ quan tâm DATA, không quan tâm HTTP response
 * - Service có thể được gọi từ nhiều nơi (controller, cron job, etc), không lúc nào cũng có res
 * - Response formatting là job của controller/middleware, không phải service
 * - Service throw error, let controller/errorHandler decide cách format response
 * 
 * Cách dùng:
 * try {
 *   const favourite = await clearFavouritesService(user_id);
 *   res.success(favourite, "Xóa thành công");
 * } catch (error) {
 *   next(error);  // errorHandler xử lý
 * }
 */

// Mock Favourite model (thực tế dùng real DB model)
class Favourite {
  constructor(user_id) {
    this.user_id = user_id;
    this.products = [];
  }
  
  save() {
    // Mock: giả lập save vào DB
    return Promise.resolve(this);
  }
  
  static findByUserId(user_id) {
    // Mock: giả lập tìm từ DB
    // Thực tế sẽ là: return Favourite.findOne({ user_id })
    return Promise.resolve(
      user_id === 1 
        ? new Favourite(1) 
        : null
    );
  }
}

const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

/**
 * Clear tất cả favourite của user
 * @param {number} user_id - ID của user
 * @returns {Promise<Object>} - Favourite object (với products = [])
 * @throws {ApiError} - Nếu không tìm thấy favourite hoặc lỗi DB
 */
const clearFavouritesService = async (user_id) => {
  try {
    // 1. Tìm favourite của user
    const favourite = await Favourite.findByUserId(user_id);
    
    // 2. Nếu không có => throw error (không return error object!)
    if (!favourite) {
      throw new ApiError(404, 4004, "Không tìm thấy danh sách yêu thích");
    }
    
    // 3. Xóa products (clear array)
    favourite.products = [];
    
    // 4. Save lại vào DB
    await favourite.save();
    
    // 5. Return data (chỉ data, không { EC, EM })
    logger.info(`Cleared favourites for user ${user_id}`);
    return favourite;
    
  } catch (error) {
    // Re-throw nếu là ApiError, bỏ qua kiểm tra không cần thiết
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Nếu là lỗi khác (DB error, etc), throw ApiError
    logger.error(`Error clearing favourites: ${error.message}`);
    throw new ApiError(500, -1, "Lỗi hệ thống");
  }
};

/**
 * Get danh sách yêu thích của user
 * @param {number} user_id - ID của user
 * @returns {Promise<Object>} - Favourite object
 * @throws {ApiError} - Nếu không tìm thấy
 */
const getFavouritesService = async (user_id) => {
  const favourite = await Favourite.findByUserId(user_id);
  
  if (!favourite) {
    throw new ApiError(404, 4004, "Không tìm thấy danh sách yêu thích");
  }
  
  return favourite;
};

/**
 * Add product vào favourite
 * @param {number} user_id - ID của user
 * @param {number} product_id - ID của product cần add
 * @returns {Promise<Object>} - Favourite object
 * @throws {ApiError}
 */
const addToFavouritesService = async (user_id, product_id) => {
  const favourite = await Favourite.findByUserId(user_id);
  
  if (!favourite) {
    throw new ApiError(404, 4004, "Không tìm thấy danh sách yêu thích");
  }
  
  // Check trùng lặp
  if (favourite.products.includes(product_id)) {
    throw new ApiError(400, 4001, "Sản phẩm đã có trong danh sách yêu thích");
  }
  
  favourite.products.push(product_id);
  await favourite.save();
  
  return favourite;
};

module.exports = {
  clearFavouritesService,
  getFavouritesService,
  addToFavouritesService
};
