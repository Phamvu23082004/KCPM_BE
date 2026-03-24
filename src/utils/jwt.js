const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
    return jwt.sign({
        _id: user._id,
        username: user.username,
        role: user.role
    },
    ACCESS_TOKEN_SECRET,
    {
        algorithm: "HS256",
        expiresIn: "15m",
    }
);
}

const generateRefreshToken = (user, sessionId) => {
  return jwt.sign(
    {
      _id: user._id,
        username: user.username,
        role: user.role
    },
    REFRESH_TOKEN_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "7d",
    }
  );
};

module.exports = {generateAccessToken, generateRefreshToken}