const ApiError = require("../utils/ApiError");
const deviceService = require("../services/Device.service");

const createDevice = async (req, res, next) => {
  try {
    const { device_name, category, location } = req.body;
    if (!device_name || !category || !location) {
      throw new ApiError(400, 1001, "Thiếu thông tin bắt buộc");
    }

    const result = await deviceService.createDevice(req.body);
    return res.success(result, "Thêm thiết bị thành công", 200);
  } catch (error) {
    next(error);
  }
};

const getAllDevices = async (req, res, next) => {
  try {
    const result = await deviceService.getAllDevices();
    return res.success(result, "Lấy tất cả thiết bị thành công", 200);
  } catch (error) {
    next(error);
  }
};

const getDevicebyId = async (req, res, next) => {
  try {
    const _id = req.params.id;
    if (!_id) {
      throw new ApiError(400, 1003, "Thiếu mã thiết bị");
    }

    const result = await deviceService.getDevicebyId(_id);
    return res.success(result, "Lấy thiết bị thành công", 200);
  } catch (error) {
    next(error);
  }
};

const updateDevice = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const updateData = req.body;

    if (!_id) {
      throw new ApiError(400, 1005, "Thiếu mã thiết bị");
    }

    const allowedFields = [
      "device_name",
      "category",
      "location",
      "status",
      "purchase_date",
      "warranty_expiry",
      "manufacturer",
      "notes",
    ];

    const filteredData = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        filteredData[field] = updateData[field];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new ApiError(400, 1006, "Không có dữ liệu hợp lệ để cập nhật");
    }

    const result = await deviceService.updateDevice(_id, filteredData);
    return res.success(result, "Cập nhật thiết bị thành công", 200);
  } catch (error) {
    next(error);
  }
};

const softDeleteDevice = async (req, res, next) => {
  try {
    const _id = req.params.id;
    if (!_id) {
      throw new ApiError(400, 1007, "Thiếu mã thiết bị");
    }

    const result = await deviceService.softDeleteDevice(_id);
    return res.success(result, "Xóa mềm thiết bị thành công", 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDevice,
  getAllDevices,
  getDevicebyId,
  updateDevice,
  softDeleteDevice,
};