const express = require("express");
const router = express.Router();

const users = require("./user");
const importUser = require("./importUser");
const password = require("./password");
const order = require("./order");
const orderLine = require("./orderLine");

router.use("/users", users);
router.use("/password", password);
router.use("/importUsers", importUser);
router.use("/orders", order);
router.use("/orderLine", orderLine);

module.exports = router;
