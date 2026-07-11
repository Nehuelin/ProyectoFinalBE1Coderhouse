const { Router } = require("express");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    res.json({
      status: "success",
      message: "Products router is working",
      payload: [],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;