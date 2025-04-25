const express = require("express");
const router = express.Router();

const {
  list,
  register,
  detail,
} = require("../../../controllers/api/v1/customers");

router.get("/list", list);
router.post("/register", register);
router.get("/detail/:id", detail);

module.exports = router;
