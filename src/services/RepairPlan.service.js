const RepairPlan = require("../models/RepairPlan.model");
const Device = require("../models/Device.model");
const User = require("../models/User.model");
const WorkHistory = require("../models/WorkHistory.model");
const ApiError = require("../utils/ApiError");

const validateTechnician = async (technicianId) => {
  const technician = await User.findById(technicianId);

  if (!technician) {
    throw new ApiError(
      404,
      5009,
      "Không tìm thấy kỹ thuật viên được phân công",
    );
  }

  if (technician.role !== "technician") {
    throw new ApiError(
      400,
      5010,
      "Người được phân công không phải là kỹ thuật viên",
    );
  }

  if (technician.status && technician.status !== "active") {
    throw new ApiError(400, 5011, "Kỹ thuật viên không ở trạng thái hoạt động");
  }

  return technician;
};

const validateCreator = async (userId) => {
  const creator = await User.findById(userId);

  if (!creator) {
    throw new ApiError(404, 5012, "Không tìm thấy người tạo yêu cầu sửa chữa");
  }

  if (creator.status && creator.status !== "active") {
    throw new ApiError(400, 5013, "Người tạo không ở trạng thái hoạt động");
  }

  return creator;
};

const validateStatusTransition = (oldStatus, newStatus) => {
  if (oldStatus === newStatus) return;

  const validTransitions = {
    new: ["assigned"],
    assigned: ["in_progress", "completed"],
    in_progress: ["completed"],
    completed: [],
  };

  if (!validTransitions[oldStatus]?.includes(newStatus)) {
    throw new ApiError(
      400,
      5014,
      `Không thể chuyển trạng thái từ "${oldStatus}" sang "${newStatus}"`,
    );
  }
};

const createRepairPlan = async (planData) => {
  try {
    const device = await Device.findOne({
      _id: planData.device_id,
      is_deleted: false,
    });

    if (!device) {
      throw new ApiError(404, 5001, "Không tìm thấy thiết bị");
    }

    if (device.status === "under_maintenance") {
      throw new ApiError(
        400,
        5015,
        "Thiết bị đang trong quá trình bảo trì, không thể tạo yêu cầu sửa chữa",
      );
    }

    const existingOpenRepair = await RepairPlan.findOne({
      device_id: planData.device_id,
      is_deleted: false,
      status: { $ne: "completed" },
    });

    if (existingOpenRepair) {
      throw new ApiError(
        400,
        5016,
        "Thiết bị đã có yêu cầu sửa chữa chưa hoàn thành",
      );
    }

    await validateCreator(planData.created_by);
    await validateTechnician(planData.assigned_technician_id);

    if (!planData.status) {
      planData.status = "assigned";
    }

    if (
      planData.assigned_technician_id &&
      (planData.status === "assigned" || planData.status === "in_progress") &&
      !planData.assigned_at
    ) {
      planData.assigned_at = new Date();
    }

    if (planData.status === "completed" && !planData.completed_at) {
      planData.completed_at = new Date();
    }

    const newPlan = new RepairPlan(planData);
    await newPlan.save();

    return await RepairPlan.findById(newPlan._id)
      .populate("device_id", "device_name")
      .populate("assigned_technician_id", "username full_name")
      .populate("created_by", "username full_name");
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error.name === "CastError") {
      throw new ApiError(400, 5017, "Mã dữ liệu không hợp lệ");
    }

    if (error.name === "ValidationError") {
      throw new ApiError(400, 5018, "Dữ liệu yêu cầu sửa chữa không hợp lệ");
    }

    throw new ApiError(500, 5019, "Tạo yêu cầu sửa chữa thất bại");
  }
};

const getAllRepairPlans = async () => {
  try {
    const plans = await RepairPlan.find({ is_deleted: false })
      .populate("device_id", "device_name")
      .populate("assigned_technician_id", "username full_name")
      .populate("created_by", "username full_name")
      .sort({ created_at: -1 });

    return plans;
  } catch (error) {
    throw new ApiError(500, 5020, "Lấy danh sách yêu cầu sửa chữa thất bại");
  }
};

const getRepairPlanById = async (planId) => {
  try {
    const plan = await RepairPlan.findOne({
      _id: planId,
      is_deleted: false,
    })
      .populate("device_id")
      .populate("assigned_technician_id")
      .populate("created_by");

    if (!plan) {
      throw new ApiError(404, 5003, "Không tìm thấy yêu cầu sửa chữa");
    }

    return plan;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error.name === "CastError") {
      throw new ApiError(400, 5021, "Mã yêu cầu sửa chữa không hợp lệ");
    }

    throw new ApiError(500, 5022, "Lấy yêu cầu sửa chữa thất bại");
  }
};

const updateRepairPlan = async (planId, planUpdateData, historyData = {}) => {
  try {
    const oldPlan = await RepairPlan.findOne({
      _id: planId,
      is_deleted: false,
    });

    if (!oldPlan) {
      throw new ApiError(404, 5003, "Không tìm thấy yêu cầu sửa chữa");
    }

    if (oldPlan.status === "completed") {
      throw new ApiError(
        400,
        5023,
        "Yêu cầu sửa chữa đã hoàn thành, không thể cập nhật thêm",
      );
    }

    const device = await Device.findOne({
      _id: oldPlan.device_id,
      is_deleted: false,
    });

    if (!device) {
      throw new ApiError(404, 5001, "Không tìm thấy thiết bị");
    }

    const oldStatus = oldPlan.status;
    const newStatus = planUpdateData.status || oldStatus;

    validateStatusTransition(oldStatus, newStatus);

    const technicianId =
      planUpdateData.assigned_technician_id || oldPlan.assigned_technician_id;

    if (
      newStatus === "assigned" ||
      newStatus === "in_progress" ||
      newStatus === "completed" ||
      planUpdateData.assigned_technician_id
    ) {
      if (!technicianId) {
        throw new ApiError(
          400,
          5024,
          "Yêu cầu sửa chữa phải được phân công kỹ thuật viên",
        );
      }

      await validateTechnician(technicianId);
    }

    if (
      planUpdateData.assigned_technician_id &&
      !planUpdateData.assigned_at &&
      !oldPlan.assigned_at
    ) {
      planUpdateData.assigned_at = new Date();
    }

    if (
      newStatus === "assigned" &&
      !planUpdateData.assigned_at &&
      !oldPlan.assigned_at
    ) {
      planUpdateData.assigned_at = new Date();
    }

    const isCompleting = oldStatus !== "completed" && newStatus === "completed";

    if (isCompleting) {
      if (!planUpdateData.repair_result && !oldPlan.repair_result) {
        throw new ApiError(400, 5025, "Cần có kết quả sửa chữa khi hoàn thành");
      }

      if (!planUpdateData.completed_at) {
        planUpdateData.completed_at = new Date();
      }
    }

    if (planUpdateData.cost !== undefined) {
      planUpdateData.cost = Number(planUpdateData.cost) || 0;
    }

    const updatedPlan = await RepairPlan.findByIdAndUpdate(
      planId,
      planUpdateData,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("device_id", "device_name")
      .populate("assigned_technician_id", "username full_name")
      .populate("created_by", "username full_name");

    if (isCompleting) {
      const finalTechnicianId =
        updatedPlan.assigned_technician_id?._id ||
        updatedPlan.assigned_technician_id;
      const deviceId = updatedPlan.device_id?._id || updatedPlan.device_id;

      if (!finalTechnicianId) {
        throw new ApiError(
          400,
          5026,
          "Không có kỹ thuật viên để lưu lịch sử sửa chữa",
        );
      }

      if (!deviceId) {
        throw new ApiError(
          400,
          5027,
          "Không có thiết bị để lưu lịch sử sửa chữa",
        );
      }

      await WorkHistory.create({
        work_type: "repair",
        source_id: updatedPlan._id,
        device_id: deviceId,
        technician_id: finalTechnicianId,
        title: updatedPlan.title,
        description: updatedPlan.issue_description || null,
        result: updatedPlan.repair_result || null,
        completed_at: updatedPlan.completed_at || new Date(),
        status_before: historyData.status_before || null,
        status_after: historyData.status_after || null,
        cost:
          historyData.cost !== undefined
            ? Number(historyData.cost) || 0
            : Number(updatedPlan.cost) || 0,
      });
    }

    return updatedPlan;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error.name === "CastError") {
      throw new ApiError(400, 5028, "Mã dữ liệu không hợp lệ");
    }

    if (error.name === "ValidationError") {
      throw new ApiError(
        400,
        5029,
        "Dữ liệu cập nhật yêu cầu sửa chữa không hợp lệ",
      );
    }

    throw new ApiError(500, 5030, "Cập nhật yêu cầu sửa chữa thất bại");
  }
};

const softDeleteRepairPlan = async (planId) => {
  try {
    const deletedPlan = await RepairPlan.findOneAndUpdate(
      {
        _id: planId,
        is_deleted: false,
      },
      {
        is_deleted: true,
        deleted_at: new Date(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!deletedPlan) {
      throw new ApiError(404, 5003, "Không tìm thấy yêu cầu sửa chữa");
    }

    return deletedPlan;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error.name === "CastError") {
      throw new ApiError(400, 5031, "Mã yêu cầu sửa chữa không hợp lệ");
    }

    throw new ApiError(500, 5032, "Xóa mềm yêu cầu sửa chữa thất bại");
  }
};

const getRepairHistoryByDevice = async (deviceId) => {
  try {
    const history = await WorkHistory.find({
      work_type: "repair",
      device_id: deviceId,
    })
      .populate("technician_id", "username full_name")
      .populate("device_id", "device_name")
      .sort({ completed_at: -1 });

    return history;
  } catch (error) {
    if (error.name === "CastError") {
      throw new ApiError(400, 5033, "Mã thiết bị không hợp lệ");
    }

    throw new ApiError(500, 5034, "Lấy lịch sử sửa chữa thất bại");
  }
};

const getRepairPlansByStatus = async (status) => {
  try {
    const plans = await RepairPlan.find({
      status,
      is_deleted: false,
    })
      .populate("device_id", "device_name")
      .populate("assigned_technician_id", "username full_name")
      .populate("created_by", "username full_name")
      .sort({ created_at: -1 });

    return plans;
  } catch (error) {
    throw new ApiError(
      500,
      5035,
      "Lấy danh sách yêu cầu sửa chữa theo trạng thái thất bại",
    );
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
