const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const jwt = require("../utils/jwt");
const UserService = require("../services/User.service");

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("../models/User.model", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../utils/jwt", () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));

describe("UserService - Lab3 Unit Testing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser - match Lab2 USER-CREATE", () => {
    test("UTCID01 - N - tạo user mới thành công, password được hash", async () => {
      const input = {
        username: "user01",
        password: "User@123",
        full_name: "Nguyễn Văn User",
        email: "user01@example.com",
        role: "staff",
        status: "active",
      };

      const createdUser = {
        _id: "user01_id",
        full_name: "Nguyễn Văn User",
        username: "user01",
        role: "staff",
        email: "user01@example.com",
        status: "active",
        created_at: "2026-05-15",
        updated_at: "2026-05-15",
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed_User@123");
      User.create.mockResolvedValue(createdUser);

      const result = await UserService.createUser(input);

      expect(User.findOne).toHaveBeenCalledWith({ username: "user01" });
      expect(bcrypt.hash).toHaveBeenCalledWith("User@123", 10);
      expect(User.create).toHaveBeenCalledWith({
        full_name: "Nguyễn Văn User",
        username: "user01",
        password: "hashed_User@123",
        role: "staff",
        email: "user01@example.com",
        status: "active",
      });

      expect(result).toEqual(createdUser);
      expect(result.password).toBeUndefined();
    });

    test("UTCID02 - B - username admin01 đã tồn tại", async () => {
      const input = {
        username: "admin01",
        password: "Admin@123",
        full_name: "Admin",
        email: "admin01b@example.com",
        role: "admin",
        status: "active",
      };

      User.findOne.mockResolvedValue({
        _id: "existing_admin_id",
        username: "admin01",
      });

      await expect(UserService.createUser(input)).rejects.toThrow(
        "Username đã tồn tại"
      );

      expect(User.findOne).toHaveBeenCalledWith({ username: "admin01" });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });

    test("UTCID03 - A - username user01 bị trùng", async () => {
      const input = {
        username: "user01",
        password: "Other@123",
        full_name: "User",
        email: "dup@example.com",
        role: "staff",
        status: "active",
      };

      User.findOne.mockResolvedValue({
        _id: "existing_user_id",
        username: "user01",
      });

      await expect(UserService.createUser(input)).rejects.toThrow(
        "Username đã tồn tại"
      );

      expect(User.findOne).toHaveBeenCalledWith({ username: "user01" });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });

    test("UTCID04 - N - tạo user role technician thành công với status active", async () => {
      const input = {
        username: "tech01",
        password: "Tech@123",
        full_name: "Kỹ thuật viên 01",
        email: "tech01@example.com",
        role: "technician",
        status: "active",
      };

      const createdUser = {
        _id: "tech01_id",
        full_name: "Kỹ thuật viên 01",
        username: "tech01",
        role: "technician",
        email: "tech01@example.com",
        status: "active",
        created_at: "2026-05-15",
        updated_at: "2026-05-15",
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed_Tech@123");
      User.create.mockResolvedValue(createdUser);

      const result = await UserService.createUser(input);

      expect(User.findOne).toHaveBeenCalledWith({ username: "tech01" });
      expect(bcrypt.hash).toHaveBeenCalledWith("Tech@123", 10);
      expect(User.create).toHaveBeenCalledWith({
        full_name: "Kỹ thuật viên 01",
        username: "tech01",
        password: "hashed_Tech@123",
        role: "technician",
        email: "tech01@example.com",
        status: "active",
      });

      expect(result.username).toBe("tech01");
      expect(result.role).toBe("technician");
      expect(result.status).toBe("active");
      expect(result.password).toBeUndefined();
    });

    test("UTCID05 - A - model validation lỗi khi email không hợp lệ", async () => {
      const input = {
        username: "invalid01",
        password: "N/A",
        full_name: "In User",
        email: "email",
        role: "staff",
        status: "active",
      };

      const validationError = new Error("Dữ liệu user không hợp lệ");
      validationError.name = "ValidationError";

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed_N/A");
      User.create.mockRejectedValue(validationError);

      await expect(UserService.createUser(input)).rejects.toThrow(
        "Dữ liệu user không hợp lệ"
      );

      expect(User.findOne).toHaveBeenCalledWith({ username: "invalid01" });
      expect(bcrypt.hash).toHaveBeenCalledWith("N/A", 10);
      expect(User.create).toHaveBeenCalledWith({
        full_name: "In User",
        username: "invalid01",
        password: "hashed_N/A",
        role: "staff",
        email: "email",
        status: "active",
      });
    });
  });

  describe("loginUser - match Lab2 USER-LOGIN", () => {
    test("UTCID01 - N - đăng nhập thành công, trả accessToken và refreshToken", async () => {
      const fakeUser = {
        _id: "admin01_id",
        full_name: "Admin",
        username: "admin01",
        password: "hashed_Admin@123",
        role: "admin",
        email: "admin01@example.com",
        status: "active",
        created_at: "2026-05-15",
        updated_at: "2026-05-15",
      };

      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.generateAccessToken.mockReturnValue("access_token");
      jwt.generateRefreshToken.mockReturnValue("refresh_token");

      const result = await UserService.loginUser({
        username: "admin01",
        password: "Admin@123",
      });

      expect(User.findOne).toHaveBeenCalledWith({ username: "admin01" });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "Admin@123",
        "hashed_Admin@123"
      );

      expect(jwt.generateAccessToken).toHaveBeenCalledWith({
        _id: "admin01_id",
        username: "admin01",
        role: "admin",
      });

      expect(jwt.generateRefreshToken).toHaveBeenCalledWith({
        _id: "admin01_id",
        username: "admin01",
        role: "admin",
      });

      expect(result.accessToken).toBe("access_token");
      expect(result.refreshToken).toBe("refresh_token");
      expect(result.password).toBeUndefined();
    });

    test("UTCID02 - A - username ghost01 không đúng", async () => {
      User.findOne.mockResolvedValue(null);

      await expect(
        UserService.loginUser({
          username: "ghost01",
          password: "Ghost@123",
        })
      ).rejects.toThrow("Username không đúng");

      expect(User.findOne).toHaveBeenCalledWith({ username: "ghost01" });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.generateAccessToken).not.toHaveBeenCalled();
      expect(jwt.generateRefreshToken).not.toHaveBeenCalled();
    });

    test("UTCID03 - A - password Wrong@123 không đúng", async () => {
      const fakeUser = {
        _id: "admin01_id",
        username: "admin01",
        password: "hashed_Admin@123",
        role: "admin",
        status: "active",
      };

      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        UserService.loginUser({
          username: "admin01",
          password: "Wrong@123",
        })
      ).rejects.toThrow("Password không đúng");

      expect(User.findOne).toHaveBeenCalledWith({ username: "admin01" });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "Wrong@123",
        "hashed_Admin@123"
      );
      expect(jwt.generateAccessToken).not.toHaveBeenCalled();
      expect(jwt.generateRefreshToken).not.toHaveBeenCalled();
    });

    test("UTCID04 - B - tài khoản lock01 bị khóa hoặc không hoạt động", async () => {
      const fakeUser = {
        _id: "lock01_id",
        username: "lock01",
        password: "hashed_Lock@123",
        role: "technician",
        status: "inactive",
      };

      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);

      await expect(
        UserService.loginUser({
          username: "lock01",
          password: "Lock@123",
        })
      ).rejects.toThrow("Tài khoản đã bị khóa hoặc không hoạt động");

      expect(User.findOne).toHaveBeenCalledWith({ username: "lock01" });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "Lock@123",
        "hashed_Lock@123"
      );
      expect(jwt.generateAccessToken).not.toHaveBeenCalled();
      expect(jwt.generateRefreshToken).not.toHaveBeenCalled();
    });
  });
});