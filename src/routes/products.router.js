const { Router } = require("express");

const {
	getProducts,
	getProductById,
  createProduct,
	updateProduct,
	deleteProduct,
} = require("../controllers/products.controller");

const router = Router();

router.get("/", getProducts);
router.get("/:pid", getProductById);
router.post("/", createProduct);
router.put("/:pid", updateProduct);
router.delete("/:pid", deleteProduct);

module.exports = router;