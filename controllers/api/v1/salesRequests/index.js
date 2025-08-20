const create = require("./create");
const list = require("./list");
const detail = require("./detail");
const deleteItem = require("./delete");
const updateItem = require("./update");
const createSalesRequest = require("./createSalesRequest");
const detailSalesRequest = require("./detailSalesRequest");
const listSalesRequest = require("./listSalesRequest");
const draftSalesRequest = require("./draftSalesRequest");
const editSalesRequest = require("./editSalesRequest");
const deleteSalesRequest = require("./deleteSalesRequest");

module.exports = {
  create,
  list,
  detail,
  draftSalesRequest,
  createSalesRequest,
  editSalesRequest,
  detailSalesRequest,
  listSalesRequest,
  editSalesRequest,
  deleteSalesRequest,
  deleteItem,
  updateItem,
};
