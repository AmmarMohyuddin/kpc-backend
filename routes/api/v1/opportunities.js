const express = require("express");
const router = express.Router();

const {
  listOpportunities,
  createOpportunity,
  detailOpportunity,
  deleteOpportunity,
  editOpportunity,
} = require("../../../controllers/api/v1/opportunities");

router.get("/listOpportunities", listOpportunities);
router.post("/createOpportunity", createOpportunity);
router.get("/detailOpportunity/:id", detailOpportunity);
router.post("/deleteOpportunity", deleteOpportunity);
router.post("/editOpportunity", editOpportunity);

module.exports = router;
