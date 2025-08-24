const express = require("express");
const router = express.Router();

const {
  listOpportunities,
} = require("../../../controllers/api/v1/opportunities");

router.get("/listOpportunities", listOpportunities);

module.exports = router;
