const express = require("express");
const mongoose = require("mongoose");
const userAuthenticate = require("../middleware/userProtected");
const Vendor = require("../models/Vendor").Vendor;
const { Cart } = require("../models/Cart.js");
const { Item } = require("../models/item");
const { Category } = require("../models/Category");
const errorResponce = require("../utils/errorResponce");
const otpRoute = require("./otpRoutes");
const {
  checkout,
  paymentverification,
} = require("../controller/paymentController");
const { counters } = require("sharp");

const app = express();
const router = express.Router();

// @desc    Get all vendors
// @route   GET /api/v1/vendors
// @access  Public

//Vendor List for Canteen Front Page
router.get("/vendorlist", userAuthenticate, async (req, res, next) => {
  try {
    const vendors = await Vendor.find({}, ["_id", "name", "image"]);
    res.status(200).json({ data: vendors });
  } catch (err) {
    next(err);
  }
});
router.use("/signup", require("./otpRoutes"));
router.post("/signin", require("../controller/userAuth").signin);
router.get(
  "/signout",
  userAuthenticate,
  require("../controller/userAuth").signout
);

//Get user Data for Profile Page

router.get("/about", userAuthenticate, (req, res) => {
  res.send(req.rootUser);
});

router.get("/getdata", userAuthenticate, (req, res) => {
  res.send(req.rootUser);
});

router.post(
  "/addtocart",
  userAuthenticate,
  require("../controller/userDashboard").addtocart
);

router.get(
  "/:vendor/getcart",
  userAuthenticate,
  require("../controller/userDashboard").getcart
);

router.get(
  "/deletecart",
  userAuthenticate,
  require("../controller/userDashboard").deleteCart
);

router.post(
  "/addtocartonebyone",
  userAuthenticate,
  require("../controller/userDashboard").addtocartOnebyOne
);

router.post(
  "/removefromcartonebyone",
  userAuthenticate,
  require("../controller/userDashboard").removefromcartOnebyOne
);

//Test Code
router.get("/:reqVendorId/items", userAuthenticate, async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ _id: req.params.reqVendorId }, [
      "_id",
      "name",
      "image",
    ]);
    if (!vendor) {
      return next(new errorResponce("Vendor not found", 404));
    }
    const category = await Category.find({ createdBy: vendor._id }, [
      "_id",
      "name",
      "image",
    ]);
    if (!category) {
      return next(new errorResponce("Category not found", 404));
    }

    const items = await Item.find({ createdBy: vendor._id }, [
      "_id",
      "name",
      "image",
      "price",
      "description",
      "category",
    ]);
    if (!items) {
      return next(new errorResponce("Items not found", 404));
    }
    res.status(200).json({ category: category, items: items });
  } catch (err) {
    next(err);
  }
});

router.post("/checkout", userAuthenticate, checkout);

router.post("/paymentverification", userAuthenticate, paymentverification);

router.post(
  "/placeorder",
  userAuthenticate,
  require("../controller/userDashboard").CustomerOrder
);
router.get(
  "/getorders",
  userAuthenticate,
  require("../controller/userDashboard").getorders
);

router.get("/getkey", userAuthenticate, (req, res) => {
  res.status(200).json({
    key: process.env.RAZORPAY_KEY_ID,
  });
});

module.exports = router;
