const jwt = require("jsonwebtoken");
const express = require("express");
const User = require("../models/User");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());

const userAuthenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken;
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    const rootUser = await User.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });
    if (!rootUser) {
      return res.status(402).send("User Not found");
      // throw new Error("User not found");
    }
    req.token = token;
    req.rootUser = rootUser;
    req.userID = rootUser._id;
    next();
  } catch (err) {
    return res.status(401).send("Unauthorized: No token provided");
  }
};

module.exports = userAuthenticate;
