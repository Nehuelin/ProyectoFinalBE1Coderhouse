const { Router } = require("express");

const {
  createCart,
  getCartById,
  addProductToCart,
  removeProductFromCart,
  updateCartProducts,
  updateProductQuantity,
  clearCart,
} = require("../controllers/carts.controller");

const router = Router();

router.post("/", createCart);
router.post("/:cid/products/:pid", addProductToCart);
router.get("/:cid", getCartById);
router.put("/:cid", updateCartProducts);
router.put("/:cid/products/:pid", updateProductQuantity);
router.delete("/:cid", clearCart);
router.delete("/:cid/products/:pid", removeProductFromCart);

module.exports = router;