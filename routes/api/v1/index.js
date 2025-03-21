const express = require("express");
const router = express.Router();

const users = require("./user");
const importUser = require("./importUser");
const password = require("./password");

router.use("/users", users);
router.use("/password", password);
router.use("/importUsers", importUser);

module.exports = router;
