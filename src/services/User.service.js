const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");

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

module.exports = {
  createUser,
};