const { Router } = require("express");

const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Products router is working",
    payload: [],
  });
});

module.exports = router;
