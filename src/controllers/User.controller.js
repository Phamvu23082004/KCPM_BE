const ApiError = require("../utils/ApiError");
const UserService = require("../services/User.service");

const createUser = async (req, res, next) => {
  try {
    const { full_name, username, password, role, email, status } = req.body;

    if (!full_name || !username || !password || !role) {
      throw new ApiError(400, 1002, "Thiếu thông tin bắt buộc");
    }

    if (!["admin", "technician"].includes(role)) {
      throw new ApiError(400, 1003, "Role không hợp lệ");
    }

    if (status && !["active", "inactive"].includes(status)) {
      throw new ApiError(400, 1004, "Status không hợp lệ");
    }

    const result = await UserService.createUser({
      full_name,
      username,
      password,
      role,
      email,
      status,
    });

    return res.success(result, "Tạo user thành công", 201);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const result = await UserService.getAllUsers();
    return res.success(result, "Lấy danh sách user thành công", 200);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await UserService.getUserById(id);
    return res.success(result, "Lấy chi tiết user thành công", 200);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, username, password, role, email, status } = req.body;

    if (role && !["admin", "technician"].includes(role)) {
      throw new ApiError(400, 1003, "Role không hợp lệ");
    }

    if (status && !["active", "inactive"].includes(status)) {
      throw new ApiError(400, 1004, "Status không hợp lệ");
    }

    const result = await UserService.updateUser(id, {
      full_name,
      username,
      password,
      role,
      email,
      status,
    });

    return res.success(result, "Cập nhật user thành công", 200);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await UserService.deleteUser(id);
    return res.success(result, "Xóa user thành công", 200);
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ApiError(400, 1009, "Vui lòng nhập username và password");
    }

    const result = await UserService.loginUser({ username, password });

    return res.success(result, "Đăng nhập thành công", 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
};