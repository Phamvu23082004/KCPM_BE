const express = require("express");
const authController = require("../controllers/Auth.controller")

const router = express.Router();

router.post("/refresh", authController.refresh);

module.exports = router;