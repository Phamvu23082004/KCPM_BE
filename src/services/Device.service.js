const Device = require("../models/Device.model");
const ApiError = require("../utils/ApiError");

const createDevice = async (deviceData) => {
  try {
    const newDevice = new Device(deviceData);
    await newDevice.save();
    return newDevice;
  } catch (error) {
    if (error.name === "ValidationError") {
      throw new ApiError(400, 1002, "Dữ liệu thiết bị không hợp lệ");
    }
    throw new ApiError(500, 1002, "Tạo thiết bị thất bại");
  }
};

const getAllDevices = async () => {
  try {
    const devices = await Device.find({ is_deleted: false });
    return devices;
  } catch (error) {
    throw new ApiError(500, 1008, "Lấy danh sách thiết bị thất bại");
  }
};

const getDevicebyId = async (deviceId) => {
  try {
    const device = await Device.findOne({ _id: deviceId, is_deleted: false });
    if (!device) {
      throw new ApiError(404, 1004, "Không tìm thấy thiết bị");
    }
    return device;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === "CastError") {
      throw new ApiError(400, 1003, "Mã thiết bị không hợp lệ");
    }
    throw new ApiError(500, 1009, "Lấy thông tin thiết bị thất bại");
  }
};

const updateDevice = async (deviceId, filteredData) => {
  try {
    const updatedDevice = await Device.findOneAndUpdate(
      {
        _id: deviceId,
        is_deleted: false,
      },
      filteredData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedDevice) {
      throw new ApiError(404, 1004, "Không tìm thấy thiết bị");
    }

    return updatedDevice;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === "CastError") {
      throw new ApiError(400, 1005, "Mã thiết bị không hợp lệ");
    }
    if (error.name === "ValidationError") {
      throw new ApiError(400, 1006, "Dữ liệu cập nhật không hợp lệ");
    }
    throw new ApiError(500, 1010, "Cập nhật thiết bị thất bại");
  }
};

const softDeleteDevice = async (deviceId) => {
  try {
    const deleteDevice = await Device.findOneAndUpdate(
      {
        _id: deviceId,
        is_deleted: false,
      },
      {
        is_deleted: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!deleteDevice) {
      throw new ApiError(404, 1007, "Không tìm thấy thiết bị");
    }

    return deleteDevice;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === "CastError") {
      throw new ApiError(400, 1007, "Mã thiết bị không hợp lệ");
    }
    throw new ApiError(500, 1011, "Xóa mềm thiết bị thất bại");
  }
};

module.exports = {
  createDevice,
  getAllDevices,
  getDevicebyId,
  updateDevice,
  softDeleteDevice,
};