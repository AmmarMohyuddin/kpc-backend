const express = require("express");
const router = express.Router();

const {
  create,
  createLead,
  listLead,
  detailLead,
  updateLead,
  createFollowup,
  listFollowup,
} = require("../../../controllers/api/v1/leads");

router.post("/create", create);
router.post("/createLead", createLead);
router.get("/listLead", listLead);
router.post("/createFollowup", createFollowup);
router.get("/detailLead", detailLead);
router.put("/updateLead", updateLead);
router.get("/listFollowup", listFollowup);

module.exports = router;
