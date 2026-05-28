# [SE113.Q21 - Backend]

Backend API cho hệ thống quản lý bảo trì và sửa chữa thiết bị.

Dự án được xây dựng bằng Node.js, Express và MongoDB. Hệ thống sử dụng JWT để xác thực và phân quyền `admin` / `technician`.

## Tính năng chính

- Xác thực đăng nhập bằng `username` / `password`
- Tạo mới và refresh JWT access token
- Quản lý user (admin only)
- Quản lý thiết bị với CRUD và soft delete
- Quản lý kế hoạch bảo trì
- Quản lý yêu cầu sửa chữa
- Truy vấn lịch sử công việc theo thiết bị hoặc kỹ thuật viên
- Middleware xử lý response và lỗi chuẩn hóa theo định dạng `EC`, `EM`, `result`

## Kiến trúc chính

- `server.js`: khởi tạo Express app, connect database, đăng ký middleware và route
- `src/config/db.js`: cấu hình kết nối MongoDB
- `src/routes/`: định nghĩa các route API
- `src/controllers/`: xử lý request và gọi service
- `src/services/`: logic nghiệp vụ, truy vấn database
- `src/models/`: schema Mongoose
- `src/middlewares/`: xác thực, phân quyền, xử lý response và lỗi
- `src/utils/`: helper JWT, ApiError, logger

## Biến môi trường

Ứng dụng sử dụng file `.env` trong thư mục gốc. Bạn có thể sao chép từ `.env.example` và điền giá trị phù hợp.

- `PORT`: cổng chạy server (mặc định `5000`)
- `MONGODB_URI`: chuỗi kết nối MongoDB
- `ACCESS_TOKEN_SECRET`: secret tạo access token JWT
- `REFRESH_TOKEN_SECRET`: secret tạo refresh token JWT

## Đường dẫn API

### Auth
- `POST /auths/refresh`
  - body: `{ refreshToken }`
  - trả về access token mới

### User
- `POST /users/login`
  - body: `{ username, password }`
- `POST /users`
  - Tạo user mới (admin)
- `GET /users`
  - Lấy danh sách người dùng (admin)
- `GET /users/:id`
  - Lấy chi tiết user (admin)
- `PUT /users/:id`
  - Cập nhật user (admin)
- `DELETE /users/:id`
  - Xóa user (admin)

### Device
- `GET /devices`
- `GET /devices/:id`
- `POST /devices` (admin)
- `PATCH /devices/:id` (admin)
- `DELETE /devices/:id` (admin)

### Maintenance Plan
- `GET /maintenance-plans`
- `GET /maintenance-plans/upcoming/list`
- `GET /maintenance-plans/:id`
- `POST /maintenance-plans` (admin)
- `PATCH /maintenance-plans/:id` (admin, technician)
- `DELETE /maintenance-plans/:id` (admin)

### Repair Plan
- `GET /repair-plans`
- `GET /repair-plans/status/filter?status=...`
- `GET /repair-plans/device/:deviceId/history`
- `GET /repair-plans/:id`
- `POST /repair-plans` (admin)
- `PATCH /repair-plans/:id` (admin, technician)
- `DELETE /repair-plans/:id` (admin)

### Work History
- `GET /work-history/device/:deviceId`
- `GET /work-history/technician/:technicianId`

## Cài đặt

```bash
cd KCPM_BE
npm install
```

## Chạy ứng dụng

```bash
npm run dev
```

Hoặc chạy production:

```bash
npm start
```

## Kiểm thử

```bash
npm test
```

## Mẫu file môi trường

Tạo file `.env` từ `.env.example` và cập nhật giá trị phù hợp với môi trường của bạn.

