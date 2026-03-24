const RepairPlan = require("../models/repairPlan.model");
const Device = require("../models/device.model");
const WorkHistory = require("../models/workHistory.model");
const ApiError = require("../utils/ApiError");

const createRepairPlan = async (planData) => {
    try {
        const device = await Device.findOne({
            _id: planData.device_id,
            is_deleted: false,
        });
        if (!device) {
            throw new ApiError(404, 5001, "Không tìm thấy thiết bị");
        }

        const newPlan = new RepairPlan(planData);
        await newPlan.save();
        return newPlan;
    } catch (error) {
        console.log("error:", error);
        console.log("name:", error.name);
        console.log("message:", error.message);
        console.log("instanceof ApiError:", error instanceof ApiError);

        if (error instanceof ApiError) throw error;
        throw new ApiError(500, 5002, "Tạo yêu cầu sửa chữa thất bại");
    }
};

const getAllRepairPlans = async () => {
    try {
        const plans = await RepairPlan.find({ is_deleted: false })
            .populate("device_id", "device_name")
            .populate("assigned_technician_id", "username")
            .populate("created_by", "username")
            .sort({ created_at: -1 });
        return plans;
    } catch (error) {
        throw error;
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
        throw error;
    }
};

const updateRepairPlan = async (planId, planUpdateData, historyData) => {
    try {
        const oldPlan = await RepairPlan.findOne({
            _id: planId,
            is_deleted: false,
        });

        if (!oldPlan) {
            throw new ApiError(404, 5003, "Không tìm thấy yêu cầu sửa chữa");
        }

        const oldStatus = oldPlan.status;
        const newStatus = planUpdateData.status || oldStatus;
        const isCompleting =
            oldStatus !== "completed" && newStatus === "completed";

        if (isCompleting && !planUpdateData.completed_at) {
            planUpdateData.completed_at = new Date();
        }

        const updatedPlan = await RepairPlan.findByIdAndUpdate(
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
                work_type: "repair",
                source_id: updatedPlan._id,
                device_id: deviceId,
                technician_id: technicianId,
                title: updatedPlan.title,
                description: updatedPlan.issue_description || null,
                result: updatedPlan.repair_result || null,
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
            }
        );

        if (!deletedPlan) {
            throw new ApiError(404, 5003, "Không tìm thấy yêu cầu sửa chữa");
        }
        return deletedPlan;
    } catch (error) {
        throw error;
    }
};

const getRepairHistoryByDevice = async (deviceId) => {
    try {
        const history = await WorkHistory.find({
            work_type: "repair",
            device_id: deviceId,
        })
            .populate("technician_id", "username")
            .populate("device_id", "device_name")
            .sort({ completed_at: -1 });
        return history;
    } catch (error) {
        throw error;
    }
};

const getRepairPlansByStatus = async (status) => {
    try {
        const plans = await RepairPlan.find({
            status: status,
            is_deleted: false,
        })
            .populate("device_id", "device_name")
            .populate("assigned_technician_id", "username")
            .populate("created_by", "username")
            .sort({ created_at: -1 });
        return plans;
    } catch (error) {
        throw error;
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
