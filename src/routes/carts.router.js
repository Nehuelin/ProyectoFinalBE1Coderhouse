const { Router } = require("express");

const {
  createCart,
  getCartById,
  addProductToCart,
} = require("../controllers/carts.controller");

const router = Router();

router.post("/", createCart);
router.get("/:cid", getCartById);

router.post("/:cid/products/:pid", addProductToCart);

module.exports = router;