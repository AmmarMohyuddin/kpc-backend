const express = require("express");
const router = express.Router();

const { list, register } = require("../../../controllers/api/v1/salesPersons");

router.get("/list", list);
router.post("/register", register);

module.exports = router;
