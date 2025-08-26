const express = require("express");
const router = express.Router();

const {
  listOpportunities,
  createOpportunity,
  detailOpportunity,
  deleteOpportunity,
} = require("../../../controllers/api/v1/opportunities");

router.get("/listOpportunities", listOpportunities);
router.post("/createOpportunity", createOpportunity);
router.get("/detailOpportunity/:id", detailOpportunity);
router.post("/deleteOpportunity", deleteOpportunity);

module.exports = router;
