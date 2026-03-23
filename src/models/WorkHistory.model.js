const mongoose = require("mongoose");

const workHistorySchema = new mongoose.Schema(
  {
    work_type: {
      type: String,
      enum: ["maintenance", "repair"],
      required: true,
    },
    source_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    device_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    technician_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    result: {
      type: String,
      default: null,
      trim: true,
    },
    status_before: {
      type: String,
      default: null,
      trim: true,
    },
    status_after: {
      type: String,
      default: null,
      trim: true,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    completed_at: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
    collection: "workHistory",
  }
);

workHistorySchema.index({ device_id: 1, completed_at: -1 });
workHistorySchema.index({ technician_id: 1, completed_at: -1 });
workHistorySchema.index({ work_type: 1 });

module.exports = mongoose.model("WorkHistory", workHistorySchema);