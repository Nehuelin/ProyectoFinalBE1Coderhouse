const { Router } = require("express");

const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "E-commerce API is running",
  });
});

module.exports = router;