const create = require("./create");
const list = require("./list");
const detail = require("./detail");
const deleteItem = require("./delete");
const updateItem = require("./update");
const createSalesRequest = require("./createSalesRequest");

module.exports = {
  create,
  list,
  detail,
  createSalesRequest,
  deleteItem,
  updateItem,
};
