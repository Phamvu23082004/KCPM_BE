const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, 1001, "Bạn chưa đăng nhập");
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
            algorithms: ["HS256"],
        });

        req.user = {
            _id: decoded._id,
            username: decoded.username,
            role: decoded.role,
        };

        next();
    } catch (error) {
        next(new ApiError(401, 1002, "Access token không hợp lệ hoặc đã hết hạn"));
    }
};

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new ApiError(401, 1003, "Bạn chưa đăng nhập");
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new ApiError(403, 1004, "Bạn không có quyền truy cập");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    authenticate,
    authorize,
};
