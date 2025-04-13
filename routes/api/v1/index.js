const express = require("express");
const router = express.Router();

const users = require("./user");
const importUser = require("./importUser");
const password = require("./password");
const order = require("./order");

router.use("/users", users);
router.use("/password", password);
router.use("/importUsers", importUser);
router.use("/orders", order);

module.exports = router;
