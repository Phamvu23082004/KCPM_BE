/**
 * Favourite Routes
 * Endpoint mẫu cho favourite feature
 * 
 * Cách dùng routes:
 * const favouriteRoutes = require("./favourite");
 * app.use("/api/favourites", favouriteRoutes);
 */

const express = require("express");
const router = express.Router();

const {
  clearFavourites,
  getFavourites,
  addToFavourites
} = require("../controllers/favourite.controller");

/**
 * GET /api/favourites/:user_id
 * Lấy danh sách yêu thích của user
 */
router.get("/:user_id", getFavourites);

/**
 * POST /api/favourites/:user_id/add
 * Thêm product vào danh sách yêu thích
 * Body: { product_id: number }
 */
router.post("/:user_id/add", addToFavourites);

/**
 * DELETE /api/favourites/:user_id/clear
 * Xóa toàn bộ danh sách yêu thích
 */
router.delete("/:user_id/clear", clearFavourites);

module.exports = router;
