const MaintenancePlan = require("../models/MaintenancePlan.model");
const Device = require("../models/Device.model");
const User = require("../models/User.model");
const WorkHistory = require("../models/WorkHistory.model");
const ApiError = require("../utils/ApiError");

const isWarrantyExpired = (device) => {
  if (!device?.warranty_expiry) return false;
  return new Date(device.warranty_expiry) < new Date();
};

const isValidDeviceStatus = (status) => {
  return ["active", "under_maintenance", "broken", "inactive"].includes(status);
};

const createMaintenancePlan = async (planData) => {
  try {
    const device = await Device.findOne({
      _id: planData.device_id,
      is_deleted: false,
    });

    if (!device) {
      throw new ApiError(404, 3001, "Không tìm thấy thiết bị");
    }

    const technician = await User.findById(planData.assigned_technician_id);
    if (!technician) {
      throw new ApiError(
        404,
        3002,
        "Không tìm thấy kỹ thuật viên được phân công",
      );
    }

    if (technician.role !== "technician") {
      throw new ApiError(
        400,
        3003,
        "Người được phân công không phải là kỹ thuật viên",
      );
    }

    if (technician.status && technician.status !== "active") {
      throw new ApiError(
        400,
        3004,
        "Kỹ thuật viên không ở trạng thái hoạt động",
      );
    }

    const creator = await User.findById(planData.created_by);
    if (!creator) {
      throw new ApiError(
        404,
        3005,
        "Không tìm thấy người tạo kế hoạch bảo trì",
      );
    }

    if (creator.status && creator.status !== "active") {
      throw new ApiError(400, 3006, "Người tạo không ở trạng thái hoạt động");
    }

    if (device.status === "broken") {
      throw new ApiError(
        400,
        3007,
        "Thiết bị đang hỏng, không thể tạo kế hoạch bảo trì, hãy tạo kế hoạch sửa chữa",
      );
    }

    if (isWarrantyExpired(device)) {
      throw new ApiError(
        400,
        3008,
        "Thiết bị đã hết bảo hành, không thể tạo kế hoạch bảo trì, hãy chuyển sang sửa chữa",
      );
    }

    if (device.status === "under_maintenance") {
      throw new ApiError(
        400,
        3009,
        "Thiết bị đang trong quá trình bảo trì, không thể tạo thêm kế hoạch mới",
      );
    }

    const existingOpenPlan = await MaintenancePlan.findOne({
      device_id: planData.device_id,
      is_deleted: false,
      status: { $ne: "completed" },
    });

    if (existingOpenPlan) {
      throw new ApiError(
        400,
        3010,
        "Thiết bị đã có kế hoạch bảo trì chưa hoàn thành",
      );
    }

    const newPlan = new MaintenancePlan(planData);
    await newPlan.save();

    return await MaintenancePlan.findById(newPlan._id)
      .populate("device_id", "device_name")
      .populate("assigned_technician_id", "username full_name")
      .populate("created_by", "username full_name");
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error.name === "CastError") {
      throw new ApiError(400, 3011, "Mã dữ liệu không hợp lệ");
    }

    if (error.name === "ValidationError") {
      throw new ApiError(400, 3012, "Dữ liệu kế hoạch bảo trì không hợp lệ");
    }

    throw new ApiError(500, 3013, "Tạo kế hoạch bảo trì thất bại");
  }
};

const getAllMaintenancePlans = async () => {
  try {
    const plans = await MaintenancePlan.find({ is_deleted: false })
      .populate("device_id", "device_name")
      .populate("assigned_technician_id", "username full_name")
      .populate("created_by", "username full_name")
      .sort({ scheduled_date: 1 });

    return plans;
  } catch (error) {
    throw new ApiError(500, 3014, "Lấy danh sách kế hoạch bảo trì thất bại");
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
      throw new ApiError(404, 3015, "Không tìm thấy kế hoạch bảo trì");
    }

    return plan;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error.name === "CastError") {
      throw new ApiError(400, 3016, "Mã kế hoạch bảo trì không hợp lệ");
    }

    throw new ApiError(500, 3017, "Lấy kế hoạch bảo trì thất bại");
  }
};

const updateMaintenancePlan = async (
  planId,
  planUpdateData,
  historyData = {},
) => {
  try {
    const oldPlan = await MaintenancePlan.findOne({
      _id: planId,
      is_deleted: false,
    });

    if (!oldPlan) {
      throw new ApiError(404, 3015, "Không tìm thấy kế hoạch bảo trì");
    }

    if (oldPlan.status === "completed") {
      throw new ApiError(
        400,
        3018,
        "Kế hoạch bảo trì đã hoàn thành, không thể cập nhật thêm",
      );
    }

    const device = await Device.findOne({
      _id: oldPlan.device_id,
      is_deleted: false,
    });

    if (!device) {
      throw new ApiError(404, 3001, "Không tìm thấy thiết bị");
    }

    const technicianId =
      planUpdateData.assigned_technician_id || oldPlan.assigned_technician_id;

    const technician = await User.findById(technicianId);
    if (!technician) {
      throw new ApiError(
        404,
        3002,
        "Không tìm thấy kỹ thuật viên được phân công",
      );
    }

    if (technician.role !== "technician") {
      throw new ApiError(
        400,
        3003,
        "Người được phân công không phải là kỹ thuật viên",
      );
    }

    if (technician.status && technician.status !== "active") {
      throw new ApiError(
        400,
        3004,
        "Kỹ thuật viên không ở trạng thái hoạt động",
      );
    }

    const newStatus = planUpdateData.status || oldPlan.status;
    const oldStatus = oldPlan.status;
    const isStarting = oldStatus === "pending" && newStatus === "in_progress";
    const isCompleting = oldStatus !== "completed" && newStatus === "completed";

    if (oldStatus === "pending" && newStatus === "completed") {
      throw new ApiError(
        400,
        3019,
        "Không thể chuyển trực tiếp từ chờ thực hiện sang hoàn thành",
      );
    }

    if (
      oldStatus === "in_progress" &&
      newStatus !== "in_progress" &&
      newStatus !== "completed"
    ) {
      throw new ApiError(
        400,
        3020,
        "Không thể chuyển trạng thái không hợp lệ từ đang thực hiện",
      );
    }

    if ((isStarting || isCompleting) && isWarrantyExpired(device)) {
      throw new ApiError(
        400,
        3021,
        "Thiết bị đã hết bảo hành, không thể thực hiện bảo trì, hãy chuyển sang sửa chữa",
      );
    }

    if ((isStarting || isCompleting) && device.status === "broken") {
      throw new ApiError(
        400,
        3022,
        "Thiết bị đang hỏng, không thể thực hiện bảo trì, hãy chuyển sang sửa chữa",
      );
    }

    if ((isStarting || isCompleting) && !technicianId) {
      throw new ApiError(
        400,
        3023,
        "Kế hoạch bảo trì chưa được phân công kỹ thuật viên",
      );
    }

    if (isCompleting && !planUpdateData.result && !oldPlan.result) {
      throw new ApiError(400, 3024, "Cần có kết quả bảo trì khi hoàn thành");
    }

    if (isCompleting && !planUpdateData.completed_at) {
      planUpdateData.completed_at = new Date();
    }

    const updatedPlan = await MaintenancePlan.findByIdAndUpdate(
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

    if (isStarting) {
      await Device.findByIdAndUpdate(device._id, {
        status: "under_maintenance",
      });
    }

    if (isCompleting) {
      const nextDeviceStatus =
        historyData.status_after &&
        isValidDeviceStatus(historyData.status_after)
          ? historyData.status_after
          : "active";

      await Device.findByIdAndUpdate(device._id, {
        status: nextDeviceStatus,
      });

      const finalTechnicianId =
        updatedPlan.assigned_technician_id?._id ||
        updatedPlan.assigned_technician_id;
      const deviceId = updatedPlan.device_id?._id || updatedPlan.device_id;

      if (!finalTechnicianId) {
        throw new ApiError(
          400,
          3025,
          "Không có kỹ thuật viên để lưu lịch sử công việc",
        );
      }

      if (!deviceId) {
        throw new ApiError(
          400,
          3026,
          "Không có thiết bị để lưu lịch sử công việc",
        );
      }

      await WorkHistory.create({
        work_type: "maintenance",
        source_id: updatedPlan._id,
        device_id: deviceId,
        technician_id: finalTechnicianId,
        title: updatedPlan.title,
        description: updatedPlan.description || null,
        result: updatedPlan.result || null,
        completed_at: updatedPlan.completed_at || new Date(),
        status_before: historyData.status_before || null,
        status_after: historyData.status_after || null,
        cost: Number(historyData.cost) || 0,
      });
    }

    return updatedPlan;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error.name === "CastError") {
      throw new ApiError(400, 3027, "Mã dữ liệu không hợp lệ");
    }

    if (error.name === "ValidationError") {
      throw new ApiError(
        400,
        3028,
        "Dữ liệu cập nhật kế hoạch bảo trì không hợp lệ",
      );
    }

    throw new ApiError(500, 3029, "Cập nhật kế hoạch bảo trì thất bại");
  }
};

const softDeleteMaintenancePlan = async (planId) => {
  try {
    const plan = await MaintenancePlan.findOne({
      _id: planId,
      is_deleted: false,
    });

    if (!plan) {
      throw new ApiError(404, 3015, "Không tìm thấy kế hoạch bảo trì");
    }

    if (plan.status === "in_progress") {
      throw new ApiError(
        400,
        3030,
        "Không thể xóa kế hoạch bảo trì đang thực hiện",
      );
    }

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
      },
    );

    return deletedPlan;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error.name === "CastError") {
      throw new ApiError(400, 3031, "Mã kế hoạch bảo trì không hợp lệ");
    }

    throw new ApiError(500, 3032, "Xóa mềm kế hoạch bảo trì thất bại");
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
      .populate("assigned_technician_id", "username full_name")
      .sort({ scheduled_date: 1 });

    return plans;
  } catch (error) {
    throw new ApiError(
      500,
      3033,
      "Lấy danh sách kế hoạch bảo trì sắp tới thất bại",
    );
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
