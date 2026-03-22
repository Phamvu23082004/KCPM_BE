# Sport E-Commerce Backend API

Một backend service hoàn chỉnh cho nền tảng thương mại điện tử thể thao, được xây dựng bằng Node.js, Express.js, MongoDB, và Mongoose.

## 📋 Yêu cầu hệ thống

- Node.js (v14 hoặc cao hơn)
- npm hoặc yarn
- MongoDB Atlas account (hoặc MongoDB local)

## 🏗️ Cấu trúc thư mục

```
sportecommerceservices/
├── .vscode/              # Cấu hình VS Code
├── src/
│   ├── config/           # Kết nối cơ sở dữ liệu, cấu hình môi trường
│   ├── controllers/       # Xử lý request, gọi service
│   ├── middlewares/       # Xử lý lỗi, authen, authz
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Helper functions
├── test/                 # Test files
├── .env                  # Biến môi trường (bí mật)
├── .env.example          # Mẫu biến môi trường
├── .gitignore            # Git ignore patterns
├── package.json          # Project metadata và dependencies
└── server.js             # Entry point
```

## 📦 Cài đặt

### 1. Clone hoặc tạo project

```bash
cd d:\KCPM
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình biến môi trường

Sao chép `.env.example` thành `.env` và cập nhật thông tin MongoDB:

```bash
cp .env.example .env
```

Chỉnh sửa `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://phamquangvu2308:YOUR_PASSWORD@cluster0.inzif.mongodb.net/
MONGODB_DB_NAME=sportecommerce
```

**⚠️ Lưu ý:** Thay thế `YOUR_PASSWORD` bằng password thực của MongoDB Atlas.

## 🚀 Chạy project

### Chế độ Development (với auto-reload)

```bash
npm run dev
```

### Chế độ Production

```bash
npm start
```

Server sẽ chạy tại `http://localhost:5000`

## 🧪 Test API

### 1. Test Health Check

Mở Postman hoặc terminal:

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "uptime": 125.456,
  "environment": "development",
  "version": "1.0.0"
}
```

### 2. Test Root Endpoint

```bash
curl http://localhost:5000/
```

Response:
```json
{
  "message": "Sport E-Commerce Backend API"
}
```

## 📄 Mô tả từng thư mục

### `src/config/`
Chứa cấu hình kết nối MongoDB với Mongoose, biến môi trường.

### `src/controllers/`
Xử lý incoming requests từ routes, call services, trả về responses.

### `src/middlewares/`
Middleware như error handler, authentication, authorization, logging.

### `src/models/`
Định nghĩa MongoDB schemas bằng Mongoose (User, Product, Order, etc).

### `src/routes/`
Định nghĩa các API endpoints, kết nối với controllers.

### `src/services/`
Chứa business logic, xử lý dữ liệu, tương tác với database qua models.

### `src/utils/`
Các helper functions, logger, validators, formatters.

## 🔄 Workflow của một request

```
Request → Route → Controller → Service → Model (Database) → Response
```

### Ví dụ: GET /api/health

1. **Route** (`src/routes/health.js`):
   - Định nghĩa endpoint `/health`
   - Call `healthController.getHealth`

2. **Controller** (`src/controllers/healthController.js`):
   - Nhận request
   - Call `healthService.getHealthStatus()`
   - Trả về response

3. **Service** (`src/services/healthService.js`):
   - Xử lý logic để lấy health status
   - Trả về dữ liệu

## 📚 Mở rộng project

### Thêm User Model routes

1. Tạo `src/routes/users.js`
2. Tạo `src/controllers/userController.js`
3. Tạo `src/services/userService.js`
4. Include routes trong `src/routes/index.js`

Ví dụ:
```javascript
// src/routes/index.js
const userRoutes = require('./users');
router.use('/users', userRoutes);
```

## 🛠️ Các công cụ và thư viện

- **Express.js**: Web framework
- **Mongoose**: MongoDB object modeling
- **dotenv**: Quản lý biến môi trường
- **CORS**: Cross-Origin Resource Sharing
- **nodemon**: Auto-restart khi code thay đổi (dev only)

## 📝 Ghi chú quan trọng

- ❌ **Không hardcode** password hoặc key nhạy cảm
- ✅ **Luôn dùng** `.env` để quản lý biến môi trường
- ✅ **Thêm** `.env` vào `.gitignore`
- ✅ **Cung cấp** `.env.example` cho team

## 🐛 Troubleshooting

### MongoDB Connection Error
- Kiểm tra password trong `.env`
- Kiểm tra IP whitelist trong MongoDB Atlas
- Kiểm tra database name

### Port Already in Use
- Thay đổi PORT trong `.env`
- Hoặc kill process đang sử dụng port

## 📧 Liên hệ & Support

Cần thêm tính năng? Tạo issue hoặc pull request.

---

**Version**: 1.0.0  
**Last Updated**: 2024
