const express = require('express');
const healthRoutes = require('./health');
const favouriteRoutes = require('./favourite');

const router = express.Router();

/**
 * API Routes
 * Kết hợp các route từ các module khác nhau
 * 
 * Kiến trúc:
 * /api/favourites - Danh sách yêu thích
 * /api/users - Users (sắp tới)
 */


// Favourite routes (ví dụ clean architecture)
router.use('/favourites', favouriteRoutes);

// Các route khác sẽ được thêm ở đây
// router.use('/users', userRoutes);
// router.use('/products', productRoutes);

module.exports = router;
