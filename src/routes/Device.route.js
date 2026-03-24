const express = require("express");
const DeviceController = require("../controllers/Device.controller")

const router = express.Router();

router.get("/", DeviceController.getAllDevices);
router.get("/:id", DeviceController.getDevicebyId);
router.post("/" , DeviceController.createDevice);
router.patch("/:id", DeviceController.updateDevice);
router.delete("/:id" , DeviceController.softDeleteDevice);

module.exports = router 