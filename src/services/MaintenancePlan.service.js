const MaintenancePlan = require("../models/maintenancePlan.model");
const Device = require("../models/device.model");
const WorkHistory = require("../models/workHistory.model");
const ApiError = require("../utils/ApiError");

const createMaintenancePlan = async (planData) => {
  try {
    const device = await Device.findOne({
      _id: planData.device_id,
      is_deleted: false,
    });
    if (!device) {
      throw new ApiError(404, 3001, "Không tìm thấy thiết bị");
    }

    const newPlan = new MaintenancePlan(planData);
    await newPlan.save();
    return newPlan;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 3002, "Tạo kế hoạch bảo trì thất bại");
  }
};

const getAllMaintenancePlans = async () => {
  try {
    const plans = await MaintenancePlan.find({ is_deleted: false })
      .populate("device_id", "device_name")
      .populate("assigned_technician_id", "username")
      .populate("created_by", "username")
      .sort({ scheduled_date: 1 });
    return plans;
  } catch (error) {
    throw error;
  }
};

const getMaintenancePlanById = async (planId) => {
  try {
    const plan = await MaintenancePlan.findOne({
      _id: planId,
      is_deleted: false,
    })
      .populate("device_id")
      .populate("assigned_technician_id")
      .populate("created_by");
    if (!plan) {
      throw new ApiError(404, 3003, "Không tìm thấy kế hoạch bảo trì");
    }
    return plan;
  } catch (error) {
    throw error;
  }
};

const updateMaintenancePlan = async (planId, planUpdateData, historyData) => {
  try {
    const oldPlan = await MaintenancePlan.findOne({
      _id: planId,
      is_deleted: false,
    });

    if (!oldPlan) {
      throw new ApiError(404, 3003, "Không tìm thấy kế hoạch bảo trì");
    }

    const oldStatus = oldPlan.status;
    const newStatus = planUpdateData.status || oldStatus;
    const isCompleting =
      oldStatus !== "completed" && newStatus === "completed";

    if (isCompleting && !planUpdateData.completed_at) {
      planUpdateData.completed_at = new Date();
    }

    const updatedPlan = await MaintenancePlan.findByIdAndUpdate(
      planId,
      planUpdateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("device_id", "device_name")
      .populate("assigned_technician_id", "username")
      .populate("created_by", "username");

    if (isCompleting) {
      const technicianId = updatedPlan.assigned_technician_id?._id || updatedPlan.assigned_technician_id;
      const deviceId = updatedPlan.device_id?._id || updatedPlan.device_id;

      await WorkHistory.create({
        work_type: "maintenance",
        source_id: updatedPlan._id,
        device_id: deviceId,
        technician_id: technicianId,
        title: updatedPlan.title,
        description: updatedPlan.description || null,
        result: updatedPlan.result || null,
        completed_at: updatedPlan.completed_at || new Date(),
        status_before: historyData.status_before || null,
        status_after: historyData.status_after || null,
        cost: historyData.cost || 0,
      });
    }

    return updatedPlan;
  } catch (error) {
    throw error;
  }
};

const softDeleteMaintenancePlan = async (planId) => {
  try {
    const deletedPlan = await MaintenancePlan.findOneAndUpdate(
      {
        _id: planId,
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

    if (!deletedPlan) {
      throw new ApiError(404, 3003, "Không tìm thấy kế hoạch bảo trì");
    }
    return deletedPlan;
  } catch (error) {
    throw error;
  }
};

const getUpcomingMaintenancePlans = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const plans = await MaintenancePlan.find({
      scheduled_date: { $gte: today, $lte: sevenDaysLater },
      status: { $ne: "completed" },
      is_deleted: false,
    })
      .populate("device_id", "device_name")
      .populate("assigned_technician_id", "name email")
      .sort({ scheduled_date: 1 });

    return plans;
  } catch (error) {
    throw error;
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
