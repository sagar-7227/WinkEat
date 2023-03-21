const jwt = require("jsonwebtoken");
const express = require("express");
const Vendor = require("../models/Vendor").Vendor;
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());

const vendorAuthenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken;
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    const rootVendor = await Vendor.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });
    if (!rootVendor) {
      throw new Error("Vendor not found");
    }
    req.token = token;
    req.rootVendor = rootVendor;
    req.vendorID = rootVendor._id;
    next();
  } catch (err) {
    res.status(401).send("Unauthorized: No token provided");
  }
};

module.exports = vendorAuthenticate;
