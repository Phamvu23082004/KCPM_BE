const express = require("express");
const userRoutes = require("./User.route");
const authRoutes = require("./Auth.route");
const deviceRoutes = require("./Device.route");
const maintenancePlanRoutes = require("./MaintenancePlan.route");
const repairPlanRoutes = require("./RepairPlan.route");
const router = express.Router();

router.use("/users", userRoutes);
router.use("/auths", authRoutes);
router.use("/devices", deviceRoutes);
router.use("/maintenance-plans", maintenancePlanRoutes);
router.use("/repair-plans", repairPlanRoutes);

module.exports = router;