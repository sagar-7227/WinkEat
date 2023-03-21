const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    size:{
      type: String
    }
  },
  {
    timestamps: true,
  }
);

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../client/public/uploads/image/Item");
//   },
//   filename: function (req, file, cb) {
//     cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
//   },
// });

// const checkFileType = (file, cb) => {
//   const filetypes = /jpeg|jpg|png|gif/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb("Error: Images Only!");
//   }
// };

// const itemImgUpload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024 * 5,
//   },
//   fileFilter: function (req, file, cb) {
//     checkFileType(file, cb);
//   },
// });

const Item = mongoose.model("Item", itemSchema);

module.exports = {
  Item,
  // itemImgUpload,
};