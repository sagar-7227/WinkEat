//here the all otp related routes are defined

const express = require("express");

const otpController = require("../controller/otpAuth");

const router = express.Router();
router.post("/", require("../controller/userAuth").signup);
// router.post("/sendOtp", otpController.sendOTP);
router.post("/resend", otpController.reSendOTP);
router.post("/verify", otpController.verifyOTP);

module.exports = router;
