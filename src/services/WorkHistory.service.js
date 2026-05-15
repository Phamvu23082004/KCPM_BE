const WorkHistory = require("../models/WorkHistory.model");
const Device = require("../models/Device.model");
const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");

const getWorkHistoryByDevice = async (deviceId, currentUser) => {
  try {
    const device = await Device.findOne({
      _id: deviceId,
      is_deleted: false,
    });

    if (!device) {
      throw new ApiError(404, 6001, "Không tìm thấy thiết bị");
    }

    const filter = {
      device_id: deviceId,
    };

    if (currentUser.role === "technician") {
      filter.technician_id = currentUser._id;
    }

    const histories = await WorkHistory.find(filter)
      .populate("device_id", "device_name category location status")
      .populate("technician_id", "username full_name")
      .sort({ completed_at: -1, created_at: -1 });

    return histories;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === "CastError") {
      throw new ApiError(400, 6002, "Mã thiết bị không hợp lệ");
    }

    throw new ApiError(500, 6003, "Lấy lịch sử công việc theo thiết bị thất bại");
  }
};

const getWorkHistoryByTechnician = async (technicianId, currentUser) => {
  try {
    let targetTechnicianId = technicianId;

    if (currentUser.role === "technician") {
      if (
        technicianId &&
        technicianId.toString() !== currentUser._id.toString()
      ) {
        throw new ApiError(
          403,
          6004,
          "Bạn chỉ được xem lịch sử công việc của chính mình"
        );
      }

      targetTechnicianId = currentUser._id;
    }

    const technician = await User.findById(targetTechnicianId);

    if (!technician) {
      throw new ApiError(404, 6005, "Không tìm thấy kỹ thuật viên");
    }

    if (technician.role !== "technician") {
      throw new ApiError(400, 6006, "Người dùng không phải kỹ thuật viên");
    }

    const histories = await WorkHistory.find({
      technician_id: targetTechnicianId,
    })
      .populate("device_id", "device_name category location status")
      .populate("technician_id", "username full_name")
      .sort({ completed_at: -1, created_at: -1 });

    return histories;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === "CastError") {
      throw new ApiError(400, 6007, "Mã kỹ thuật viên không hợp lệ");
    }

    throw new ApiError(
      500,
      6008,
      "Lấy lịch sử công việc theo kỹ thuật viên thất bại"
    );
  }
};

module.exports = {
  getWorkHistoryByDevice,
  getWorkHistoryByTechnician,
};