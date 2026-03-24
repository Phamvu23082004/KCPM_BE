const mongoose = require("mongoose");

const repairPlanstSchema = new mongoose.Schema(
  {
    device_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    issue_description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["new", "assigned", "in_progress", "completed"],
      default: "new",
    },
    assigned_technician_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assigned_at: {
      type: Date,
      default: null,
    },
    completed_at: {
      type: Date,
      default: null,
    },
    repair_result: {
      type: String,
      default: null,
      trim: true,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "RepairPlans",
  }
);

// repairPlanstSchema.index({ ticket_code: 1 }, { unique: true });
repairPlanstSchema.index({ device_id: 1 });
repairPlanstSchema.index({ assigned_technician_id: 1 });
repairPlanstSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model("RepairPlan", repairPlanstSchema);