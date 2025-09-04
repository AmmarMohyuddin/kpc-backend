const express = require("express");
const router = express.Router();

const {
  uninvoicedOrders,
  openOrders,
  orderHistory,
  orderChart,
} = require("../../../controllers/api/v1/salesOrders");

router.get("/uninvoiced-orders", uninvoicedOrders);
router.get("/open-orders", openOrders);
router.get("/order-history", orderHistory);
router.get("/order-chart", orderChart);

module.exports = router;
