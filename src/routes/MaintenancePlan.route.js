const express = require("express");
const MaintenancePlanController = require("../controllers/MaintenancePlan.controller");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("admin", "technician"),
  MaintenancePlanController.getAllMaintenancePlans,
);

router.get(
  "/upcoming/list",
  authenticate,
  authorize("admin", "technician"),
  MaintenancePlanController.getUpcomingMaintenancePlans,
);

router.get(
  "/:id",
  authenticate,
  authorize("admin", "technician"),
  MaintenancePlanController.getMaintenancePlanById,
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  MaintenancePlanController.createMaintenancePlan,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  MaintenancePlanController.softDeleteMaintenancePlan,
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin", "technician"),
  MaintenancePlanController.updateMaintenancePlan,
);

module.exports = router;