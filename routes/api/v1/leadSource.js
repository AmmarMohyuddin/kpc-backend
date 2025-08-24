const express = require("express");
const router = express.Router();

const { list } = require("../../../controllers/api/v1/leadSources");

router.get("/list", list);

module.exports = router;
