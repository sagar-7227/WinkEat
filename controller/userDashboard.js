const express = require("express");
require("../database/conn");
const { Item } = require("../models/item");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Vendor = require("../models/Vendor").Vendor;

const addtocart = async (req, res, next) => {
  try {
    const arr = req.body;
    let update = false;
    let added = false;
    for (let i = 0; i < arr.length; i++) {
      try {
        let item = {};
        item = req.body[i];
        const { id, quantity, price } = item;

        if (!id || !quantity || !price) {
          return res.status(400).json({ error: "Please fill all the data" });
        }
        const itemExist = await Item.findOne({ _id: id });
        if (!itemExist) {
          return res.status(400).json({ error: "Item not found" });
        }
        console.log(itemExist.createdBy);
        console.log(itemExist.createdBy);
        const cartExist = await Cart.findOne({
          customerId: req.rootUser._id,
          productStatus: "Pending",
        });
        if (cartExist) {
          const itemExistInCart = cartExist.items.find(
            (items) => items.itemId == id
          );
          if (itemExistInCart) {
            itemExistInCart.quantity += quantity;
            itemExistInCart.price += price;
            cartExist.total = cartExist.total + price;
            await cartExist.save();
            update = true;
          } else {
            cartExist.items.push({ itemId: id, quantity, price });
            cartExist.total = cartExist.total + price;
            await cartExist.save();
            added = true;
          }
        } else {
          const cart = new Cart({
            vendorId: itemExist.createdBy,
            customerId: req.rootUser._id,
            items: [{ itemId: id, quantity, price }],
            total: price,
            productStatus: "Pending",
            paymentStatus: "Pending",
          });
          await cart.save();
          added = true;
        }
      } catch (err) {
        return next(err);
      }
    }
    if (update && added) {
      return res.status(200).send({ message: "Cart Updated and Added" });
    }
    if (update) {
      return res.status(201).send({ message: "Item Updated Successfully" });
    } else if (added)
      return res.status(201).send({ message: "Items Added Successfully" });
  } catch (err) {
    return res.status(401).send({ message: "error" });
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const cartExist = await Cart.findOneAndDelete({
      customerId: req.rootUser._id,
    });
    if (!cartExist) {
      return res.status(200).json({ message: "Cart not found" });
    }
    res.status(200).json({ message: "Cart Deleted Successfully" });
  } catch (err) {
    return next(err);
  }
};

const addtocartOnebyOne = async (req, res, next) => {
  try {
    const { id, quantity, price } = req.body;
    console.log(req.body);
    if (!id || !quantity || !price) {
      return res.status(400).json({ error: "Please fill all the data" });
    }
    const itemExist = await Item.findOne({ _id: id });
    if (!itemExist) {
      return res.status(400).json({ error: "Item not found" });
    }

    const cartExist = await Cart.findOne({
      customerId: req.rootUser._id,
      productStatus: "Pending",
    });
    if (cartExist) {
      const itemExistInCart = cartExist.items.find(
        (items) => items.itemId == id
      );
      if (itemExistInCart) {
        itemExistInCart.quantity += quantity;
        itemExistInCart.price += price;
        cartExist.total = cartExist.total + price;
        await cartExist.save();
        return res.status(200).send({ message: "Cart Updated" });
      } else {
        cartExist.items.push({ itemId: id, quantity, price });
        cartExist.total = cartExist.total + price;
        await cartExist.save();
        return res.status(200).send({ message: "Cart Added" });
      }
    } else {
      const cart = new Cart({
        vendorId: itemExist.createdBy,
        customerId: req.rootUser._id,
        items: [{ itemId: id, quantity, price }],
        total: price,
        productStatus: "Pending",
        paymentStatus: "Pending",
      });
      await cart.save();
      return res.status(200).send({ message: "Cart Added" });
    }
  } catch (err) {
    return next(err);
  }
};

const removefromcartOnebyOne = async (req, res, next) => {
  try {
    console.log(req.body);
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Please fill all the data" });
    }
    const cart = await Cart.findOne({
      customerId: req.rootUser._id,
      productStatus: "Pending",
    });
    if (!cart) {
      return res.status(400).json({ error: "Cart not found" });
    }

    const itemExistInCart = cart.items.find((items) => items.itemId == id);
    if (!itemExistInCart) {
      return res.status(400).json({ error: "Item not found" });
    }
    if (itemExistInCart.quantity == 1) {
      cart.items = cart.items.filter((items) => items.itemId != id);
    } else {
      itemExistInCart.quantity -= 1;
    }
    cart.total = cart.total - itemExistInCart.price;
    await cart.save();
    return res.status(200).send({ message: "Item Removed" });
  } catch (err) {
    return next(err);
  }
};
const getcart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      customerId: req.rootUser._id,
      vendorId: req.params.vendor,
      productStatus: "Pending",
    });
    if (!cart) {
      return res.status(400).json({ error: "Cart not found" });
    }
    const cartItem = [];
    for (const element of cart.items) {
      const item = await Item.findOne({
        _id: element.itemId,
      });
      if (!item) {
        return res.status(400).json({ error: "Item not found" });
      }
      cartItem.push({
        vendorId: cart.vendorId,
        itemid: item._id,
        itemName: item.name,
        itemImage: item.image,
        itemPrice: item.price,
        itemQuantity: element.quantity,
        itemTotal: element.price,
      });
    }
    return res.status(200).json({
      cartItem,
      total: cart.total,
    });
  } catch (err) {
    return next(err);
  }
};

const CustomerOrder = async (req, res, next) => {
  try {
    console.log(req.body);
    const arr = req.body;
    let update = false;
    let added = false;
    for (let i = 0; i < arr.length; i++) {
      try {
        let item = {};
        item = req.body[i];
        const { vendor_id, id, quantity, price } = item;
        if (!vendor_id || !id || !quantity || !price) {
          return res.status(400).json({ error: "Please fill all the data" });
        }
        const itemExist = await Item.findOne({ _id: id });
        if (!itemExist) {
          return res.status(400).json({ error: "Item not found" });
        }
        const orderExist = await Order.findOne({
          customerId: req.rootUser._id,
          vendorId: vendor_id,
          paymentStatus: "pending",
        });
        if (orderExist) {
          const itemExistInOrder = orderExist.items.find(
            (items) => items.itemId == id
          );
          if (itemExistInOrder) {
            itemExistInOrder.quantity += quantity;
            orderExist.totalPrice = orderExist.totalPrice + quantity * price;
            await orderExist.save();
            update = true;
          } else {
            orderExist.items.push({ itemId: id, quantity, price });
            orderExist.totalPrice = orderExist.totalPrice + quantity * price;
            await orderExist.save();
            added = true;
          }
        } else {
          const order = new Order({
            customerId: req.rootUser._id,
            vendorId: vendor_id,
            items: [{ itemId: id, quantity, price }],
            totalPrice: quantity * price,
            productStatus: "pending",
            paymentStatus: "pending",
          });
          await order.save();
        }
      } catch (err) {
        return next(err);
      }
    }
    if (update && added) {
      return res.status(200).send({ message: "Order Updated and Added" });
    }
    if (update) {
      return res.status(201).send({ message: "Item Updated Successfully" });
    } else if (added)
      return res.status(201).send({ message: "Items Added Successfully" });
  } catch (err) {
    return res.status(401).send({ message: "error" });
  }
};

const getorders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      customerId: req.rootUser._id,
      paymentStatus: "paid",
    });
    if (!orders) {
      return res.status(400).json({ error: "Order not found" });
    }
    const orderItem = [];

    for (const order of orders) {
      const vendor = await Vendor.findOne({
        _id: order.vendorId,
      });
      for (const element of order.items) {
        const item = await Item.findOne({
          _id: element.itemId,
        });
        if (!item) {
          return res.status(400).json({ error: "Item not found" });
        }
        orderItem.push({
          itemId: item._id,
          itemName: item.name,
          itemImage: item.image,
          itemPrice: item.price,
          itemQuantity: element.quantity,
          itemTotal: order.totalPrice,
          vendorName: vendor.name,
          PaymentStatus: order.paymentStatus,
          productStatus: order.status,
        });
      }
    }

    // for (const element of orders) {
    //   for (const elementItem of element.items) {
    //     const item = await Item.findOne({
    //       _id: elementItem.itemId,
    //     });
    //     if (!item) {
    //       return res.status(400).json({ error: "Item not found" });
    //     }
    //     orderItem.push({
    //       itemId: item._id,
    //       itemName: item.name,
    //       itemImage: item.image,
    //       itemPrice: item.price,
    //       itemQuantity: elementItem.quantity,
    //       itemTotal: elementItem.price,
    //     });
    //   }
    // }

    return res.status(200).json({
      orderItem,
    });

    // return res.status(200).json({ order });

    // if (!order) {
    //   return res.status(400).json({ error: "Order not found" });
    // }
    // const orderItem = [];
    // const vendor = await Vendor.findOne({
    //   _id: order.vendorId,
    // });
    // for (const element of order.items) {
    //   const item = await Item.findOne({
    //     _id: element.itemId,
    //   });
    //   if (!item) {
    //     return res.status(400).json({ error: "Item not found" });
    //   }
    //   orderItem.push({
    //     itemId: item._id,
    //     itemName: item.name,
    //     itemImage: item.image,
    //     itemPrice: item.price,
    //     itemQuantity: element.quantity,
    //     itemTotal: order.totalPrice,
    //     vendorName: vendor.name,
    //     PaymentStatus: order.paymentStatus,
    //     productStatus: order.status,
    //   });
    // }
    // return res.status(200).json({
    //   orderItem,
    //   total: order.totalPrice,
    // });
  } catch (err) {
    return next(err);
  }
};
module.exports = {
  addtocart,
  CustomerOrder,
  getcart,
  removefromcartOnebyOne,
  addtocartOnebyOne,
  getorders,
  deleteCart,
};
