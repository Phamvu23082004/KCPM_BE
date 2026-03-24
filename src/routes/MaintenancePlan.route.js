const express = require("express");
const MaintenancePlanController = require("../controllers/MaintenancePlan.controller");

const router = express.Router();

router.get("/", MaintenancePlanController.getAllMaintenancePlans);
router.get("/upcoming/list", MaintenancePlanController.getUpcomingMaintenancePlans);
router.get("/:id", MaintenancePlanController.getMaintenancePlanById);
router.post("/", MaintenancePlanController.createMaintenancePlan);
router.patch("/:id", MaintenancePlanController.updateMaintenancePlan);
router.delete("/:id", MaintenancePlanController.softDeleteMaintenancePlan);

module.exports = router;
