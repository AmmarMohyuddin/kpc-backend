const express = require("express");
const router = express.Router();

const { list, detail } = require("../../../controllers/api/v1/importUsers");

router.get("/list", list);
router.get("/detail/:id", detail);

module.exports = router;
