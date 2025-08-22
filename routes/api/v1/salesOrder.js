const express = require("express");
const router = express.Router();

const { uninvoicedOrders } = require("../../../controllers/api/v1/salesOrders");

router.get("/uninvoiced-orders", uninvoicedOrders);

module.exports = router;
