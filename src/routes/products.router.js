const { Router } = require("express");

const {
	getProducts,
	getProductById,
  createProduct,
} = require("../controllers/products.controller");

const router = Router();

router.get("/", getProducts);
router.get("/:pid", getProductById);
router.post("/", createProduct);

module.exports = router;