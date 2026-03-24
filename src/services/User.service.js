const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt")

const SALT_ROUNDS = 10;


const createUser = async (userData) => {
  const { full_name, username, password, role, email, status } = userData;

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new ApiError(400, 1001, "Username đã tồn tại");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await User.create({
    full_name,
    username,
    password: hashedPassword,
    role,
    email,
    status,
  });

  return {
    _id: newUser._id,
    full_name: newUser.full_name,
    username: newUser.username,
    role: newUser.role,
    email: newUser.email,
    status: newUser.status,
    created_at: newUser.created_at,
    updated_at: newUser.updated_at,
  };
};

const getAllUsers = async () => {
  const users = await User.find({}, "-password").sort({ created_at: -1 });

  return users;
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new ApiError(404, 1005, "User không tồn tại");
  }

  return user;
};

const updateUser = async (userId, updateData) => {
  const { full_name, username, password, role, email, status } = updateData;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 1005, "User không tồn tại");
  }

  if (username && username !== user.username) {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new ApiError(400, 1001, "Username đã tồn tại");
    }
    user.username = username;
  }

  if (full_name !== undefined) user.full_name = full_name;
  if (role !== undefined) user.role = role;
  if (email !== undefined) user.email = email;
  if (status !== undefined) user.status = status;

  if (password) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    user.password = hashedPassword;
  }

  await user.save();

  return {
    _id: user._id,
    full_name: user.full_name,
    username: user.username,
    role: user.role,
    email: user.email,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
};

const deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 1005, "User không tồn tại");
  }

  await User.findByIdAndDelete(userId);

  return {
    _id: user._id,
    full_name: user.full_name,
    username: user.username,
  };
};

const loginUser = async ({ username, password }) => {
  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(400, 1006, "Username không đúng");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(400, 1007, "Password không đúng");
  }

  if (user.status !== "active") {
    throw new ApiError(403, 1008, "Tài khoản đã bị khóa hoặc không hoạt động");
  }

  const accessToken = generateAccessToken({
    _id: user._id,
    username: user.username,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    _id: user._id,
    username: user.username,
    role: user.role,
  });

  return {
    _id: user._id,
    full_name: user.full_name,
    username: user.username,
    role: user.role,
    email: user.email,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
    accessToken: accessToken,
    refreshToken: refreshToken
  };
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
};