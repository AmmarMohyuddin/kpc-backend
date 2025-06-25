const express = require("express");
const router = express.Router();

const users = require("./user");
const importUser = require("./importUser");
const password = require("./password");
const order = require("./order");
const orderLine = require("./orderLine");
const salesPerson = require("./salesPerson");
const customer = require("./customer");
const lead = require("./lead");

router.use("/users", users);
router.use("/password", password);
router.use("/importUsers", importUser);
router.use("/orders", order);
router.use("/orderLine", orderLine);
router.use("/salesPersons", salesPerson);
router.use("/customers", customer);
router.use("/leads", lead);

module.exports = router;
