const express = require("express");
const MaintenancePlanController = require("../controllers/MaintenancePlan.controller");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("admin"),
  MaintenancePlanController.getAllMaintenancePlans,
);

router.get(
  "/upcoming/list",
  authenticate,
  authorize("admin"),
  MaintenancePlanController.getUpcomingMaintenancePlans,
);

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  MaintenancePlanController.getMaintenancePlanById,
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  MaintenancePlanController.createMaintenancePlan,
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  MaintenancePlanController.updateMaintenancePlan,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  MaintenancePlanController.softDeleteMaintenancePlan,
);

module.exports = router;
