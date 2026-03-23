const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    device_name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "under_maintenance", "broken", "inactive"],
      default: "active",
    },
    purchase_date: {
      type: Date,
      default: null,
    },
    warranty_expiry: {
      type: Date,
      default: null,
    },
    manufacturer: {
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
    collection: "Devices",
  }
);

deviceSchema.index({
  device_name: "text",
  category: "text",
  location: "text",
});

module.exports = mongoose.model("Device", deviceSchema);