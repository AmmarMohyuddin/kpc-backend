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
  opportunityChart,
  listFollowup,
  oppFollowups,
} = require("../../../controllers/api/v1/opportunities");

router.get("/listOpportunities", listOpportunities);
router.post("/createOpportunity", createOpportunity);
router.get("/detailOpportunity/:id", detailOpportunity);
router.post("/deleteOpportunity", deleteOpportunity);
router.post("/editOpportunity", editOpportunity);
router.post("/createFollowup", createFollowup);
router.post("/convertToSales", convertToSales);
router.get("/listFollowup", listFollowup);
router.get("/getStatus", getStatus);
router.get("/opportunityChart", opportunityChart);
router.get("/oppFollowups", oppFollowups);

module.exports = router;
