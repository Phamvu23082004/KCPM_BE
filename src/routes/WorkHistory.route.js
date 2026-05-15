const express = require("express");
const WorkHistoryController = require("../controllers/WorkHistory.controller");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/device/:deviceId",
  authenticate,
  authorize("admin", "technician"),
  WorkHistoryController.getWorkHistoryByDevice,
);

router.get(
  "/technician/:technicianId",
  authenticate,
  authorize("admin", "technician"),
  WorkHistoryController.getWorkHistoryByTechnician,
);

module.exports = router;
