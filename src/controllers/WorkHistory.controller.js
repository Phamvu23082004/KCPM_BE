const ApiError = require("../utils/ApiError");
const workHistoryService = require("../services/WorkHistory.service");

const getWorkHistoryByDevice = async (req, res, next) => {
  try {
    const deviceId = req.params.deviceId;

    if (!deviceId) {
      throw new ApiError(400, 6001, "Thiếu mã thiết bị");
    }

    const result = await workHistoryService.getWorkHistoryByDevice(
      deviceId,
      req.user,
    );

    return res.success(
      result,
      "Lấy lịch sử sửa chữa, bảo trì theo thiết bị thành công",
      200,
    );
  } catch (error) {
    next(error);
  }
};

const getWorkHistoryByTechnician = async (req, res, next) => {
  try {
    const technicianId = req.params.technicianId;

    if (!technicianId) {
      throw new ApiError(400, 6005, "Thiếu mã kỹ thuật viên");
    }

    const result = await workHistoryService.getWorkHistoryByTechnician(
      technicianId,
      req.user,
    );

    return res.success(
      result,
      "Lấy lịch sử sửa chữa, bảo trì theo kỹ thuật viên thành công",
      200,
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkHistoryByDevice,
  getWorkHistoryByTechnician,
};
