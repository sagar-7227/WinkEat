const mongoose = require("mongoose");

// how to make cart schema for user ?
const cartSchema = mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    productStatus: { type: String, required: true },
    paymentStatus: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const cart = mongoose.model("Cart", cartSchema);

module.exports = cart;
