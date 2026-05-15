const express = require("express");
const DeviceController = require("../controllers/Device.controller");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("admin", "technician"),
  DeviceController.getAllDevices,
);

router.get(
  "/:id",
  authenticate,
  authorize("admin", "technician"),
  DeviceController.getDevicebyId,
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  DeviceController.createDevice,
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  DeviceController.updateDevice,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  DeviceController.softDeleteDevice,
);

module.exports = router;
