const mongoose = require("mongoose");

const maintenancePlanSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: null,
      trim: true,
    },
    scheduled_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
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
    completed_at: {
      type: Date,
      default: null,
    },
    result: {
      type: String,
      default: null,
      trim: true,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "MaintenancePlans",
  }
);

maintenancePlanSchema.index({ device_id: 1 });
maintenancePlanSchema.index({ assigned_technician_id: 1 });
maintenancePlanSchema.index({ status: 1, scheduled_date: 1 });

module.exports = mongoose.model("MaintenancePlan", maintenancePlanSchema);