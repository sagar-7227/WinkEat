const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // required
    },
    image: {
      type: String,
      required: true, // required
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
  },
  { timestamps: true }
);

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../client/public/uploads/image/Category");
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

// const CatImgUpload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024 * 5,
//   },
//   fileFilter: function (req, file, cb) {
//     checkFileType(file, cb);
//   },
// });

const Category = mongoose.model("Category", CategorySchema);

module.exports = {
  Category,
  // CatImgUpload,
};
