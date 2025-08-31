const express = require("express");
const router = express.Router();

const {
  listOpportunities,
  createOpportunity,
  detailOpportunity,
  deleteOpportunity,
  editOpportunity,
  createFollowup,
  convertToSales,
  getStatus,
} = require("../../../controllers/api/v1/opportunities");

router.get("/listOpportunities", listOpportunities);
router.post("/createOpportunity", createOpportunity);
router.get("/detailOpportunity/:id", detailOpportunity);
router.post("/deleteOpportunity", deleteOpportunity);
router.post("/editOpportunity", editOpportunity);
router.post("/createFollowup", createFollowup);
router.post("/convertToSales", convertToSales);
router.get("/getStatus", getStatus);

module.exports = router;
