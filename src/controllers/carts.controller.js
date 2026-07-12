const CartMongoDAO = require("../dao/db/CartMongoDAO");

const cartDAO = new CartMongoDAO();

async function createCart(req, res, next) {
  try {
    const newCart = await cartDAO.createCart();

    return res.status(201).json({
      status: "success",
      message: "Carrito creado exitosamente",
      payload: newCart,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCartById(req, res, next) {
  try {
    const { cid } = req.params;

    const cart = await cartDAO.getCartById(cid);

    if (!cart) {
      const error = new Error("Carrito no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      status: "success",
      payload: cart,
    });
  } catch (error) {
    return next(error);
  }
}

async function addProductToCart(req, res, next) {
  try {
    const { cid, pid } = req.params;

    const updatedCart =
      await cartDAO.addProductToCart(cid, pid);

    if (!updatedCart) {
      const error = new Error("Carrito no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      status: "success",
      message: "Producto agregado al carrito exitosamente",
      payload: updatedCart,
    });
  } catch (error) {
    return next(error);
  }
}

async function removeProductFromCart(req, res, next) {
  try {
    const { cid, pid } = req.params;

    const cart = await cartDAO.getCartById(cid);

    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    const productInCart = cart.products.some(
      (item) =>
        item.product &&
        item.product._id.toString() === pid
    );

    if (!productInCart) {
      const error = new Error(
        "Product not found in cart"
      );

      error.statusCode = 404;
      throw error;
    }

    const updatedCart =
      await cartDAO.removeProductFromCart(cid, pid);

    return res.status(200).json({
      status: "success",
      message: "Product removed from cart successfully",
      payload: updatedCart,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateCartProducts(req, res, next) {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    if (!Array.isArray(products)) {
      const error = new Error(
        'The field "products" must be an array'
      );

      error.statusCode = 400;
      throw error;
    }

    validateProductsArray(products);

    const existingCart =
      await cartDAO.getCartById(cid);

    if (!existingCart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    await cartDAO.validateProductsExist(products);

    const updatedCart =
      await cartDAO.updateCartProducts(
        cid,
        products
      );

    return res.status(200).json({
      status: "success",
      message: "Cart updated successfully",
      payload: updatedCart,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProductQuantity(req, res, next) {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      const error = new Error(
        "Quantity must be a positive integer"
      );

      error.statusCode = 400;
      throw error;
    }

    const cart = await cartDAO.getCartById(cid);

    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    const productInCart = cart.products.some(
      (item) =>
        item.product &&
        item.product._id.toString() === pid
    );

    if (!productInCart) {
      const error = new Error(
        "Product not found in cart"
      );

      error.statusCode = 404;
      throw error;
    }

    const updatedCart =
      await cartDAO.updateProductQuantity(
        cid,
        pid,
        quantity
      );

    return res.status(200).json({
      status: "success",
      message: "Product quantity updated successfully",
      payload: updatedCart,
    });
  } catch (error) {
    return next(error);
  }
}

async function clearCart(req, res, next) {
  try {
    const { cid } = req.params;

    const updatedCart =
      await cartDAO.clearCart(cid);

    if (!updatedCart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      status: "success",
      message: "Cart cleared successfully",
      payload: updatedCart,
    });
  } catch (error) {
    return next(error);
  }
}

function validateProductsArray(products) {
  const productIds = new Set();

  for (const item of products) {
    if (
      !item ||
      typeof item !== "object" ||
      !item.product
    ) {
      const error = new Error(
        "Every cart item must contain a product ID"
      );

      error.statusCode = 400;
      throw error;
    }

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      const error = new Error(
        "Every product quantity must be a positive integer"
      );

      error.statusCode = 400;
      throw error;
    }

    if (productIds.has(item.product)) {
      const error = new Error(
        `Product "${item.product}" is duplicated`
      );

      error.statusCode = 400;
      throw error;
    }

    productIds.add(item.product);
  }
}

module.exports = {
  createCart,
  getCartById,
  addProductToCart,
  removeProductFromCart,
  updateCartProducts,
  updateProductQuantity,
  clearCart
};