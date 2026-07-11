const mongoose = require("mongoose");

const cartProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Se requiere el ID del producto"],
    },

    quantity: {
      type: Number,
      required: [true, "Se requiere la cantidad del producto"],
      min: [1, "La cantidad del producto debe ser al menos 1"],
      validate: {
        validator: Number.isInteger,
        message: "La cantidad del producto debe ser un número entero",
      },
    },
  },
  {
    _id: false,
  }
);

const cartSchema = new mongoose.Schema(
  {
    products: {
      type: [cartProductSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const CartModel = mongoose.model(
  "Cart",
  cartSchema,
  "carts"
);

module.exports = CartModel;