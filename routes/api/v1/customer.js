const express = require("express");
const router = express.Router();

const {
  list,
  register,
  detail,
  getCustomers,
} = require("../../../controllers/api/v1/customers");

router.get("/list", list);
router.post("/register", register);
router.get("/detail/:id", detail);
router.get("/getCustomers", getCustomers);

module.exports = router;
