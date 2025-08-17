const express = require("express");
const router = express.Router();

const { list, detail } = require("../../../controllers/api/v1/prices");

router.get("/list", list);
router.get("/detail/:item_number", detail);

module.exports = router;
