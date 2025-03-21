const express = require("express");
const router = express.Router();

const {
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../../../controllers/api/v1/passwords");

router.post("/forgotPassword", forgotPassword);
router.post("/verifyOtp", verifyOtp);
router.post("/resetPassword", resetPassword);

module.exports = router;
