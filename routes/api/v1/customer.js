const express = require("express");
const router = express.Router();

const {
  list,
  register,
  detail,
  getCustomers,
  listing,
} = require("../../../controllers/api/v1/customers");

router.get("/list", list);
router.post("/register", register);
router.get("/detail/:id", detail);
router.get("/getCustomers", getCustomers);
router.get("/listing", listing);

module.exports = router;
