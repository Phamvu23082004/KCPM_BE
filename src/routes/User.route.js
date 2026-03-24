const express = require("express");
const UserController = require("../controllers/User.controller");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", UserController.loginUser);

router.post("/", authenticate, authorize("admin"), UserController.createUser);
router.get("/", authenticate, authorize("admin"), UserController.getAllUsers);
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  UserController.getUserById,
);
router.put("/:id", authenticate, authorize("admin"), UserController.updateUser);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  UserController.deleteUser,
);

module.exports = router;
