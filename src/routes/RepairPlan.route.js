const express = require("express");
const RepairPlanController = require("../controllers/RepairPlan.controller");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("admin", "technician"),
  RepairPlanController.getAllRepairPlans
);

router.get(
  "/status/filter",
  authenticate,
  authorize("admin", "technician"),
  RepairPlanController.getRepairPlansByStatus
);

router.get(
  "/device/:deviceId/history",
  authenticate,
  authorize("admin", "technician"),
  RepairPlanController.getRepairHistoryByDevice
);

router.get(
  "/:id",
  authenticate,
  authorize("admin", "technician"),
  RepairPlanController.getRepairPlanById
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  RepairPlanController.createRepairPlan
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  RepairPlanController.softDeleteRepairPlan
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin", "technician"),
  RepairPlanController.updateRepairPlan
);

module.exports = router;