const express = require("express");
const RepairPlanController = require("../controllers/RepairPlan.controller");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("admin"),
  RepairPlanController.getAllRepairPlans
);

router.get(
  "/status/filter",
  authenticate,
  authorize("admin"),
  RepairPlanController.getRepairPlansByStatus
);

router.get(
  "/device/:deviceId/history",
  authenticate,
  authorize("admin"),
  RepairPlanController.getRepairHistoryByDevice
);

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  RepairPlanController.getRepairPlanById
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  RepairPlanController.createRepairPlan
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  RepairPlanController.updateRepairPlan
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  RepairPlanController.softDeleteRepairPlan
);

module.exports = router;