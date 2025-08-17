const express = require("express");
const router = express.Router();

const {
  create,
  list,
  detail,
  deleteItem,
  updateItem,
  createSalesRequest,
} = require("../../../controllers/api/v1/salesRequests");

router.post("/create", create);
router.get("/item-list/:customer_id", list);
router.post("/item-detail", detail);
router.post("/item-delete", deleteItem);
router.put("/item-update", updateItem);
router.post("/create-sales-request", createSalesRequest);

module.exports = router;
