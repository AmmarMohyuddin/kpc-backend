const express = require("express");
const router = express.Router();

const {
  create,
  createLead,
  listLead,
  detailLead,
  updateLead,
} = require("../../../controllers/api/v1/leads");

router.post("/create", create);
router.post("/createLead", createLead);
router.get("/listLead", listLead);
router.get("/detailLead", detailLead);
router.put("/updateLead", updateLead);

module.exports = router;
