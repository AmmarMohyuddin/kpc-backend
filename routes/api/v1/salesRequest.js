const express = require("express");
const router = express.Router();

const {
  create,
  list,
  detail,
  deleteItem,
  updateItem,
  createSalesRequest,
  listSalesRequest,
  detailSalesRequest,
  draftSalesRequest,
  editSalesRequest,
  deleteSalesRequest,
} = require("../../../controllers/api/v1/salesRequests");

router.post("/create", create);
router.get("/item-list/:customer_id", list);
router.post("/item-detail", detail);
router.post("/item-delete", deleteItem);
router.put("/item-update", updateItem);
router.post("/create-sales-request", createSalesRequest);
router.get("/list-sales-request", listSalesRequest);
router.post("/detail-sales-request", detailSalesRequest);
router.get("/draft-sales-request", draftSalesRequest);
router.post("/edit-sales-request", editSalesRequest);
router.post("/delete-sales-request", deleteSalesRequest);

module.exports = router;
