const express = require("express");
const bcrypt = require("bcryptjs");
const { Item } = require("../models/item");
const Cart = require("../models/Cart");
const app = express();
const otpService = require("../middleware/otpService.js");

require("../database/conn");
const User = require("../models/User");

const signup = async (req, res) => {
  const { username, name, mobileNo, password, cpassword } = req.body;
  if (!username || !name || !mobileNo || !password || !cpassword) {
    return res.status(400).json({ error: "Please fill the field properly" });
  }
  if (mobileNo.length != 10) {
    return res
      .status(400)
      .json({ error: "Please enter a valid mobile number" });
  }
  try {
    const userExist = await User.findOne({ mobileNo: mobileNo });
    const userExist1 = await User.findOne({ username: username });

    if (userExist) {
      return res.status(401).json({ error: "Phone number already exist" });
    } else if (password !== cpassword) {
      return res.status(400).json({ error: "Password are not matching" });
    } else if (userExist1) {
      return res.status(400).json({ error: "username already taken" });
    } else {
      const user = new User({
        name,
        mobileNo,
        password,
        cpassword,
        username,
        status: "pending",
      });
      await user.save();
      // send and verify otp
      await otpService.sendOTP(username, mobileNo, name);

      return res.status(201).json({
        message: "Please verify your phone no to complete the process",
      });
    }
  } catch (err) {
    return res.status(400).json({ error: "Please fill the field properly" });
  }
};

// const signin = async (req, res) => {
//   try {
//     const { mobileNo, password } = req.body;

//     if (!mobileNo || !password) {
//       return res.status(400).json({ error: "Please fill the data" });
//     }
//     if (mobileNo.length != 10) {
//       return res
//         .status(400)
//         .json({ error: "Please enter a valid mobile number" });
//     }

//     const userLogin = await User.findOne({ mobileNo: mobileNo });
//     if (userLogin.status == "pending") {
//       return res
//         .status(400)
//         .json({ error: "Please verify your phone no to complete the process" });
//     } else {
//       if (userLogin) {
//         const isMatch = await bcrypt.compare(password, userLogin.password);
//         const token = await userLogin.generateAuthToken();

//         if (!isMatch) {
//           return res.status(400).json({ error: "Invalid Credentials" });
//         } else {
//           res.cookie("jwtoken", token, {
//             expires: new Date(Date.now() + 25892000000),
//             httpOnly: true,
//           });
//           console.log("Your Token is here " + token);
//           return res.status(200).json({ message: "User Signin Successfully" });
//         }
//       } else {
//         return res.status(400).json({ error: "Invalid Credentials" });
//       }
//     }
//   } catch (err) {
//     return res.status(400).json({ error: "Invalid Credentials" });
//   }
// };
const signin = async (req, res) => {
  try {
    const { mobileNo, password } = req.body;

    if (!mobileNo || !password) {
      res.status(400).json({ error: "Please fill the data" });
      return;
    }
    if (mobileNo.length != 10) {
      res.status(400).json({ error: "Please enter a valid mobile number" });
      return;
    }

    const userLogin = await User.findOne({ mobileNo: mobileNo });
    if (userLogin.status == "pending") {
      res
        .status(400)
        .json({ error: "Please verify your phone no to complete the process" });
      return;
    } else {
      if (userLogin) {
        const isMatch = await bcrypt.compare(password, userLogin.password);
        const token = await userLogin.generateAuthToken();

        if (!isMatch) {
          res.status(400).json({ error: "Invalid Credentials" });
        } else {
          res.cookie("jwtoken", token, {
            expires: new Date(Date.now() + 25892000000),
            httpOnly: true,
          });
          console.log("Your Token is here " + token);
          res.status(200).json({ message: "User Signin Successfully" });
          return;
        }
      } else {
        res.status(400).json({ error: "Invalid Credentials" });
        return;
      }
    }
  } catch (err) {
    res.status(400).json({ error: "Invalid Credentials" });
    return;
  }
};

const signout = async (req, res, next) => {
  try {
    res.clearCookie("jwtoken", { path: "/" });
    console.log("User Signout Successfully");
    return res.status(200).send("User Signout Successfully");
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  signup,
  signin,
  signout,
};
