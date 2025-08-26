const express = require("express");
const router = express.Router();

const {
  uninvoicedOrders,
  openOrders,
  orderHistory,
} = require("../../../controllers/api/v1/salesOrders");

router.get("/uninvoiced-orders", uninvoicedOrders);
router.get("/open-orders", openOrders);
router.get("/order-history", orderHistory);

module.exports = router;
