const express = require("express");
const sharp = require("sharp");
const fs = require("fs");
const { Category, upload } = require("../models/Category");
const { Item } = require("../models/item");
const { log } = require("console");
const cloudinary = require("cloudinary").v2;
const Order = require("../models/Order");
const User = require("../models/User");

// const addcategory = async (req, res, next) => {
//   console.log(req.rootVendor._id);
//   console.log(req.rootVendor.name);
//   try {
//     if (!req.file || !req.body) {
//       return res.status(400).json({ error: "Please fill the data" });
//     }
//     const categoryExist = await Category.findOne({
//       name: req.body.name,
//       createdBy: req.rootVendor._id,
//     });
//     if (categoryExist) {
//       return res.status(400).json({ error: "Category already exist" });
//     }

//     const category = new Category({
//       name: req.body.name,
//       image: req.file.filename,
//       createdBy: req.rootVendor._id,
//     });
//     await category.save();
//     res.status(201).json({ message: "Item Category Added Successfully" });
//   } catch (err) {
//     return next(err);
//   }
// };

const addcategory = async (req, res, next) => {
  // add category using cloudibry without multer
  console.log(req.rootVendor._id);
  console.log(req.rootVendor.name);
  try {
    if (!req.files || !req.body) {
      return res.status(400).json({ error: "Please fill the data" });
    }
    // console.log(req.files);
    // console.log(req.body);
    const categoryExist = await Category.findOne({
      name: req.body.name,
      createdBy: req.rootVendor._id,
    });
    if (categoryExist) {
      return res.status(400).json({ error: "Category already exist" });
    }
    const file = req.files.image;
    const uploadResponse = await cloudinary.uploader.upload(
      file.tempFilePath,
      {
        folder: "vendor/categories",
        transformation: [
          {
            width: 300,
            height: 300,
            gravity: "face",
            crop: "crop",
          },
        ],
      },
      async (err, result) => {
        if (err) {
          return res.status(400).json({
            err,
          });
        }
        const category = new Category({
          name: req.body.name,
          image: result.secure_url,
          createdBy: req.rootVendor._id,
        });
        await category.save();
        res.status(201).json({ message: "Item Category Added Successfully" });
      }
    );
  } catch (err) {
    return next(err);
  }
};

// const item = async (req, res, next) => {
//   try {
//     if (!req.file || !req.body) {
//       return res.status(400).json({ error: "Please fill all the data" });
//     }
//     const findCategory = await Category.findOne({
//       name: req.body.category,
//       createdBy: req.rootVendor._id,
//     });
//     const itemExist = await Item.findOne({
//       name: req.body.name,
//       createdBy: req.rootVendor._id,
//       category: findCategory._id,
//     });
//     if (itemExist) {
//       return res.status(400).json({ error: "Item already exist" });
//     }

//     console.log(findCategory._id);

//     const item = new Item({
//       name: req.body.name,
//       image: req.file.filename,
//       stock: req.body.stock,
//       price: req.body.price,
//       description: req.body.description,
//       category: findCategory._id,
//       createdBy: req.rootVendor._id,
//       size: req.body.size,
//     });
//     await item.save();
//     res.status(201).json({ message: "Item Added Successfully" });
//   } catch (err) {
//     return next(err);
//   }
// };

const item = async (req, res, next) => {
  try {
    if (!req.files || !req.body) {
      return res.status(400).json({ error: "Please fill all the data" });
    }
    const findCategory = await Category.findOne({
      name: req.body.category,
      createdBy: req.rootVendor._id,
    });
    const itemExist = await Item.findOne({
      name: req.body.name,
      createdBy: req.rootVendor._id,
      category: findCategory._id,
    });
    if (itemExist) {
      return res.status(400).json({ error: "Item already exist" });
    }

    // console.log(findCategory._id);

    const file = req.files.image;

    const uploadResponse = await cloudinary.uploader.upload(
      file.tempFilePath,
      {
        folder: "vendor/items",
        transformation: [
          {
            width: 300,
            height: 300,
            gravity: "face",
            crop: "crop",
          },
        ],
      },
      async (err, result) => {
        if (err) {
          return res.status(400).json({
            err,
          });
        }

        const item = new Item({
          name: req.body.name,
          image: result.secure_url,
          stock: req.body.stock,
          price: req.body.price,
          description: req.body.description,
          category: findCategory._id,
          createdBy: req.rootVendor._id,
          size: req.body.size,
        });
        await item.save();
        res.status(201).json({ message: "Item Added Successfully" });
      }
    );
  } catch (err) {
    return next(err);
  }
};

const outofstock = async (req, res, next) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id },
      { stock: 0 }
    ).exec();
    res.status(200).json({ message: "Item Out of Stock" });
  } catch (err) {
    return next(err);
  }
};

const instock = async (req, res, next) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id },
      { stock: req.body.stock }
    ).exec();
    res.status(200).json({ message: "Your Stock is Updated" });
  } catch (err) {
    return next(err);
  }
};

const deleteitem = async (req, res, next) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id }).exec();
    res.status(200).json({ message: "Item Deleted Successfully" });
  } catch (err) {
    return next(err);
  }
};

// const deletecategory = async (req, res, next) => {
//   try {
//     const category = await Category.findOneAndDelete({
//       _id: req.params.id,
//     }).exec();
//     res.status(200).json({ message: "Category Deleted Successfully" });
//   } catch (err) {
//     return next(err);
//   }
// };
const deletecategory = async (req, res, next) => {
  try {
    const image = await Category.findOne({
      _id: req.params.id,
    }).exec();

    const category = await Category.findOneAndDelete({
      _id: req.params.id,
    }).exec();
    const items = await Item.deleteMany({ category: req.params.id }).exec();
    res.status(200).json({ message: "Category Deleted Successfully" });
  } catch (err) {
    return next(err);
  }
};

const addimage = async (req, res, next) => {
  const file = req.files.image;
  cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
    if (err) {
      return res.status(400).json({
        err,
      });
    }
    return res.json({
      public_id: result.public_id,
      url: result.secure_url,
    });
  });
};

const getorders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      vendorid: req.rootVendor._id,
      paymentStatus: "paid",
    }).exec();
    if (!orders) {
      return res.status(400).json({ error: "No Orders Found" });
    }
    // console.log(orders.items);
    const orderItem = [];
    // const user = await User.findOne({ _id: orders.customerId }).exec();
    for (const order of orders) {
      const user = await User.findOne({
        _id: order.customerId,
      });
      for (const element of order.items) {
        const item = await Item.findOne({
          _id: element.itemId,
        });
        if (!item) {
          return res.status(400).json({ error: "Item not found" });
        }
        orderItem.push({
          id: order._id,
          itemId: item._id,
          itemName: item.name,
          itemImage: item.image,
          itemPrice: item.price,
          itemQuantity: element.quantity,
          itemTotal: order.totalPrice,
          customerName: user.name,
          paymentStatus: order.paymentStatus,
          productStatus: order.status,
        });
      }
    }
    res.status(200).json({ orderItem });
  } catch (err) {
    return next(err);
  }
};

const changeStatus = async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id },
      { status: req.body.status }
    ).exec();
    res.status(200).json({ message: "Status Updated Successfully" });
  } catch (err) {
    return next(err);
  }
};

const acceptorder = async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id },
      { status: "in progress" }
    ).exec();
    res.status(200).json({ message: "Order Accepted" });
  } catch (err) {
    return next(err);
  }
};

const rejectorder = async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id },
      { status: "rejected" }
    ).exec();
    res.status(200).json({ message: "Order Rejected" });
  } catch (err) {
    return next(err);
  }
};

const orderdelivered = async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id },
      { status: "delivered" }
    ).exec();
    res.status(200).json({ message: "Order Delivered" });
  } catch (err) {
    return next(err);
  }
};

const ordercompleted = async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id },
      { status: "completed" }
    ).exec();
    res.status(200).json({ message: "Order Completed" });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  addcategory,
  item,
  outofstock,
  instock,
  deleteitem,
  deletecategory,
  addimage,
  getorders,
  changeStatus,
  acceptorder,
  rejectorder,
  orderdelivered,
  ordercompleted,
};
