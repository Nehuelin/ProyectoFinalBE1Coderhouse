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

module.exports = {
  createCart,
  getCartById,
  addProductToCart,
};