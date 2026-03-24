const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken")
const {generateAccessToken} = require("../utils/jwt")

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
 const refresh = (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, {
            algorithms: ["HS256"],
        })

        const newAccessToken = generateAccessToken({
            _id: decoded._id,
            username: decoded.username,
            role: decoded.role,
        });

        console.log(newAccessToken)

        return newAccessToken;

    } catch (error) {
      throw new ApiError(401, 1002, "Refresh token không hợp lệ hoặc đã hết hạn");
    }
}

module.exports = {refresh}

