const ApiError = require("../utils/ApiError");
const repairPlanService = require("../services/RepairPlan.service");

const createRepairPlan = async (req, res, next) => {
  try {
    const { device_id, title, issue_description, created_by } = req.body;
    if (!device_id || !title || !issue_description || !created_by) {
      throw new ApiError(400, 5001, "Thiếu thông tin bắt buộc");
    }

    const result = await repairPlanService.createRepairPlan(req.body);
    return res.success(result, "Tạo yêu cầu sửa chữa thành công", 200);
  } catch (error) {
    next(error);
  }
};

const getAllRepairPlans = async (req, res, next) => {
  try {
    const result = await repairPlanService.getAllRepairPlans();
    return res.success(result, "Lấy danh sách yêu cầu sửa chữa thành công", 200);
  } catch (error) {
    next(error);
  }
};

const getRepairPlanById = async (req, res, next) => {
  try {
    const _id = req.params.id;
    if (!_id) {
      throw new ApiError(400, 5001, "Thiếu thông tin");
    }

    const result = await repairPlanService.getRepairPlanById(_id);
    return res.success(result, "Lấy yêu cầu sửa chữa thành công", 200);
  } catch (error) {
    next(error);
  }
};

const updateRepairPlan = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const updateData = req.body;

    if (!_id) {
      throw new ApiError(400, 5001, "Thiếu thông tin");
    }

    const planUpdateFields = [
      "title",
      "issue_description",
      "priority",
      "status",
      "assigned_technician_id",
      "repair_result",
      "notes",
      "completed_at",
    ];

    const historyFields = [
      "cost",
      "status_before",
      "status_after",
    ];

    const planUpdateData = {};
    planUpdateFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        planUpdateData[field] = updateData[field];
      }
    });

    const historyData = {};
    historyFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        historyData[field] = updateData[field];
      }
    });

    if (Object.keys(planUpdateData).length === 0 && Object.keys(historyData).length === 0) {
      throw new ApiError(400, 5002, "Không có dữ liệu hợp lệ để cập nhật");
    }

    const result = await repairPlanService.updateRepairPlan(
      _id,
      planUpdateData,
      historyData
    );
    return res.success(result, "Cập nhật yêu cầu sửa chữa thành công", 200);
  } catch (error) {
    next(error);
  }
};

const softDeleteRepairPlan = async (req, res, next) => {
  try {
    const _id = req.params.id;
    if (!_id) {
      throw new ApiError(400, 5001, "Thiếu dữ liệu");
    }

    const result = await repairPlanService.softDeleteRepairPlan(_id);
    return res.success(result, "Xóa mềm yêu cầu sửa chữa thành công", 200);
  } catch (error) {
    next(error);
  }
};

const getRepairHistoryByDevice = async (req, res, next) => {
  try {
    const deviceId = req.params.deviceId;
    if (!deviceId) {
      throw new ApiError(400, 5001, "Thiếu ID thiết bị");
    }

    const result = await repairPlanService.getRepairHistoryByDevice(deviceId);
    return res.success(result, "Lấy lịch sửa chữa thành công", 200);
  } catch (error) {
    next(error);
  }
};

const getRepairPlansByStatus = async (req, res, next) => {
  try {
    const status = req.query.status;
    if (!status) {
      throw new ApiError(400, 5001, "Thiếu trạng thái");
    }

    const validStatuses = ["new", "assigned", "in_progress", "completed"];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 5004, "Trạng thái không hợp lệ");
    }

    const result = await repairPlanService.getRepairPlansByStatus(status);
    return res.success(result, "Lấy yêu cầu theo trạng thái thành công", 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRepairPlan,
  getAllRepairPlans,
  getRepairPlanById,
  updateRepairPlan,
  softDeleteRepairPlan,
  getRepairHistoryByDevice,
  getRepairPlansByStatus,
};
