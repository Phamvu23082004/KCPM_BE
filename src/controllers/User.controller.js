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

module.exports = {
  createUser,
};
