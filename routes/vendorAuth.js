const express = require("express");
const vendorAuthenticate = require("../middleware/vendorProtected");
const app = express();
const router = express.Router();
const { Category } = require("../models/Category");
const { Item } = require("../models/item");
// const { ContactToVendor } = require("../models/Contact").ContactToVendor;
const { Vendor } = require("../models/Vendor");

const cloudinary = require("cloudinary").v2; // for cloudinary use

// Configuration of cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const {
  StepContext,
} = require("twilio/lib/rest/studio/v1/flow/engagement/step");

router.post("/signup", require("../controller/vendorAuth").signup);
router.post("/signin", require("../controller/vendorAuth").signin);
router.get(
  "/signout",
  vendorAuthenticate,
  require("../controller/vendorAuth").signout
);

router.get("/about", vendorAuthenticate, (req, res) => {
  res.send(req.rootVendor);
});
router.get("/getdata", vendorAuthenticate, (req, res) => {
  res.send(req.rootVendor);
});

router.get("/getinventory", vendorAuthenticate, async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ _id: req.rootVendor._id }, [
      "_id",
      "name",
    ]);
    if (!vendor) {
      return next(new errorResponce("Vendor not found", 404));
    }
    const category = await Category.find({ createdBy: vendor._id }, [
      "_id",
      "name",
    ]);
    if (!category) {
      return next(new errorResponce("Category not found", 404));
    }
    const items = await Item.find({ createdBy: vendor._id }, [
      "_id",
      "name",
      "price",
      "stock",
      "image",
      "category",
      "size",
    ]);
    if (!items) {
      return next(new errorResponce("Item not found", 404));
    }
    res.status(200).json({ category: category, items: items });
  } catch (err) {
    next(err);
  }
});

router.get("/getcategory", vendorAuthenticate, async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ _id: req.rootVendor._id }, [
      "_id",
      "name",
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
    res.status(200).json({ category: category });
  } catch (err) {
    next(err);
  }
});

router.get("/additem", vendorAuthenticate, async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ _id: req.rootVendor._id }, [
      "_id",
      "name",
    ]);
    if (!vendor) {
      return next(new errorResponce("Vendor not found", 404));
    }
    const category = await Category.find({ createdBy: vendor._id }, [
      "_id",
      "name",
    ]);
    if (!category) {
      return next(new errorResponce("Category not found", 404));
    }
    res.status(200).json({ category: category });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/addcategory",
  vendorAuthenticate,
  require("../controller/vendorDashboard").addcategory
);

router.post(
  "/item/new",
  vendorAuthenticate,
  require("../controller/vendorDashboard").item
);

router.post(
  "/item/outofstock/:id",
  vendorAuthenticate,
  require("../controller/vendorDashboard").outofstock
);

router.post(
  "/item/instock/:id",
  vendorAuthenticate,
  require("../controller/vendorDashboard").instock
);

router.post(
  "/item/delete/:id",
  vendorAuthenticate,
  require("../controller/vendorDashboard").deleteitem
);

router.post(
  "/category/delete/:id",
  vendorAuthenticate,
  require("../controller/vendorDashboard").deletecategory
);

// router.post("/addimage", vendorAuthenticate, (req, res) => {
//   const file = req.files.image;
//   cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
//     if (err) {
//       return res.status(400).json({
//         err,
//       });
//     }
//     res.json({
//       public_id: result.public_id,
//       url: result.secure_url,
//     });
//   });
// });

router.post(
  "/addimage",
  vendorAuthenticate,
  require("../controller/vendorDashboard").addimage
);

router.get(
  "/getorders",
  vendorAuthenticate,
  require("../controller/vendorDashboard").getorders
);

router.post(
  "/order/accept/:id",
  vendorAuthenticate,
  require("../controller/vendorDashboard").acceptorder
);

router.post(
  "/order/reject/:id",
  vendorAuthenticate,
  require("../controller/vendorDashboard").rejectorder
);

router.post(
  "/order/delivered/:id",
  vendorAuthenticate,
  require("../controller/vendorDashboard").orderdelivered
);

router.post(
  "/order/completed/:id",
  vendorAuthenticate,
  require("../controller/vendorDashboard").ordercompleted
);

router.post("/");

module.exports = router;
