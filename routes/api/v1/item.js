const express = require("express");
const router = express.Router();

const { list, detail } = require("../../../controllers/api/v1/items");

router.get("/list", list);
router.get("/detail/:item_number", detail);

module.exports = router;
