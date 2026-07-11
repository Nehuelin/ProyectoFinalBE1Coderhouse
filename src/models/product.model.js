const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Se requiere que el producto tenga un nombre"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Se requiere que el producto tenga una descripción"],
      trim: true,
    },

    code: {
      type: String,
      required: [true, "Se requiere que el producto tenga un código"],
      unique: true,
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Se requiere que el producto tenga un precio"],
      min: [0, "El precio del producto no puede ser negativo"],
    },

    status: {
      type: Boolean,
      default: true,
    },

    stock: {
      type: Number,
      required: [true, "Se requiere poner el stock del producto"],
      min: [0, "El stock del producto no puede ser negativo"],
      validate: {
        validator: Number.isInteger,
        message: "El stock del producto debe ser un número entero",
      },
    },

    category: {
      type: String,
      required: [true, "El producto debe pertenecer a una categoría"],
      trim: true,
    },

    thumbnails: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ProductModel = mongoose.model(
  "Product",
  productSchema,
  "products"
);

module.exports = ProductModel;