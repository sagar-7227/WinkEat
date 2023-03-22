const { instance } = require("../app.js");
const crypto = require("crypto");
require("../database/conn");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Vendor = require("../models/Vendor").Vendor;
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const shortid = require("shortid");

const checkout = async (req, res) => {
  try {
    const options = {
      //   amount: Number(req.body.amount * 100),
      amount: Number(req.body.amount * 100),
      currency: "INR",
      receipt: shortid.generate(),
      payment_capture: 1,
    };
    const order = await instance.orders.create(options);
    console.log(order);
    res.status(200).json({
      //   id: response.id,
      //   currency: response.currency,
      //   amount: response.amount,
      status: true,
      order,
    });
  } catch (error) {
    console.log(error);
  }
};

const paymentverification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    console.log(req.body);
    let body = razorpay_order_id + "|" + razorpay_payment_id;

    var expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    console.log("sig received ", razorpay_signature);
    console.log("sig generated ", expectedSignature);

    const isAuthentic = expectedSignature === razorpay_signature;
    console.log("isAuthentic", isAuthentic);
    if (isAuthentic) {
      //Database comes here
      const payment = new Payment({
        user: req.rootUser._id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
      await payment.save();
      // item delete from cart ?
      const deleteCart = await Cart.findOneAndUpdate({
        customerId: req.rootUser._id,
        productStatus: "Pending",
      });
      deleteCart.items = [];
      deleteCart.total = 0;
      await deleteCart.save();

      // order update for payment status?
      const updateOrder = await Order.findOneAndUpdate(
        {
          customerId: req.rootUser._id,
          paymentStatus: "pending",
        },
        {
          paymentStatus: "paid",
        }
      );

      res.redirect(
        `http://winkeat.com/success?razorpay_order_id=${razorpay_order_id}&razorpay_payment_id=${razorpay_payment_id}&razorpay_signature=${razorpay_signature}`
      );
    } else {
      res.status(400).json({
        status: false,
        message: "Payment failed",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// const success = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//       req.query;
//     res.status(200).json({
//       status: true,
//       message: "Payment Successful",
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

module.exports = { checkout, paymentverification };
