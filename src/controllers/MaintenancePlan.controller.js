const ApiError = require("../utils/ApiError");
const maintenancePlanService = require("../services/MaintenancePlan.service");

const createMaintenancePlan = async (req, res, next) => {
  try {
    const { device_id, title, scheduled_date, created_by } = req.body;
    if (!device_id || !title || !scheduled_date || !created_by) {
      throw new ApiError(400, 3001, "Thiếu thông tin bắt buộc");
    }

    const result = await maintenancePlanService.createMaintenancePlan(req.body);
    return res.success(result, "Tạo kế hoạch bảo trì thành công", 200);
  } catch (error) {
    next(error);
  }
};

const getAllMaintenancePlans = async (req, res, next) => {
  try {
    const result = await maintenancePlanService.getAllMaintenancePlans();
    return res.success(result, "Lấy danh sách kế hoạch bảo trì thành công", 200);
  } catch (error) {
    next(error);
  }
};

const getMaintenancePlanById = async (req, res, next) => {
  try {
    const _id = req.params.id;
    if (!_id) {
      throw new ApiError(400, 3001, "Thiếu thông tin");
    }

    const result = await maintenancePlanService.getMaintenancePlanById(_id);
    return res.success(result, "Lấy kế hoạch bảo trì thành công", 200);
  } catch (error) {
    next(error);
  }
};
const updateMaintenancePlan = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const updateData = req.body;

    if (!_id) {
      throw new ApiError(400, 3001, "Thiếu thông tin");
    }

    const planUpdateFields = [
      "title",
      "description",
      "scheduled_date",
      "status",
      "assigned_technician_id",
      "result",
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
      throw new ApiError(400, 3002, "Không có dữ liệu hợp lệ để cập nhật");
    }

    const result = await maintenancePlanService.updateMaintenancePlan(
      _id,
      planUpdateData,
      historyData
    );
    return res.success(result, "Cập nhật kế hoạch bảo trì thành công", 200);
  } catch (error) {
    next(error);
  }
};
  

const softDeleteMaintenancePlan = async (req, res, next) => {
  try {
    const _id = req.params.id;
    if (!_id) {
      throw new ApiError(400, 3001, "Thiếu dữ liệu");
    }

    const result = await maintenancePlanService.softDeleteMaintenancePlan(_id);
    return res.success(result, "Xóa mềm kế hoạch bảo trì thành công", 200);
  } catch (error) {
    next(error);
  }
};

const getUpcomingMaintenancePlans = async (req, res, next) => {
  try {
    const result = await maintenancePlanService.getUpcomingMaintenancePlans();
    return res.success(
      result,
      "Lấy danh sách kế hoạch bảo trì sắp tới thành công",
      200
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMaintenancePlan,
  getAllMaintenancePlans,
  getMaintenancePlanById,
  updateMaintenancePlan,
  softDeleteMaintenancePlan,
  getUpcomingMaintenancePlans,
};
