const express = require("express");
const UserController = require("../controllers/User.controller");
const {authenticate, authorize } = require("../middlewares/authMiddleware")

const router = express.Router();

router.post("/", authenticate, authorize("admin"), UserController.createUser);
router.post("/login", UserController.loginUser);
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

module.exports = router;