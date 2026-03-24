const authService = require("../services/Auth.service");
const ApiError = require("../utils/ApiError");

const refresh = async (req, res, next) => {
    try {
        const {refreshToken} = req.body;

        if (!refreshToken) {
            throw new ApiError(401, 1001, "Thieu refresh token");
        }

        const result = authService.refresh(refreshToken);

        return res.success(result, "Tao moi access token thanh cong!", 200)

    } catch (error) {
        next(error)
    }
}

module.exports = {refresh}