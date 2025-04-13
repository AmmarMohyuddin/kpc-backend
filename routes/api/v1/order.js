const express = require("express");
const router = express.Router();

const { create } = require("../../../controllers/api/v1/orders");

router.post("/create", create);

module.exports = router;
