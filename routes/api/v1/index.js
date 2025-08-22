const express = require("express");
const router = express.Router();

const users = require("./user");
const importUser = require("./importUser");
const password = require("./password");
const order = require("./order");
const orderLine = require("./orderLine");
const salesPerson = require("./salesPerson");
const customer = require("./customer");
const item = require("./item");
const lead = require("./lead");
const price = require("./price");
const salesRequest = require("./salesRequest");
const city = require("./city");
const block = require("./block");
const salesOrder = require("./salesOrder");

router.use("/users", users);
router.use("/password", password);
router.use("/importUsers", importUser);
router.use("/orders", order);
router.use("/orderLine", orderLine);
router.use("/salesPersons", salesPerson);
router.use("/customers", customer);
router.use("/prices", price);
router.use("/salesOrders", salesOrder);
router.use("/items", item);
router.use("/leads", lead);
router.use("/salesRequests", salesRequest);
router.use("/cities", city);
router.use("/blocks", block);

module.exports = router;
