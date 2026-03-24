const express = require("express");
const RepairPlanController = require("../controllers/RepairPlan.controller");

const router = express.Router();

router.get("/", RepairPlanController.getAllRepairPlans);
router.get("/status/filter", RepairPlanController.getRepairPlansByStatus);
router.get("/device/:deviceId/history", RepairPlanController.getRepairHistoryByDevice);
router.get("/:id", RepairPlanController.getRepairPlanById);
router.post("/", RepairPlanController.createRepairPlan);
router.patch("/:id", RepairPlanController.updateRepairPlan);
router.delete("/:id", RepairPlanController.softDeleteRepairPlan);

module.exports = router;
