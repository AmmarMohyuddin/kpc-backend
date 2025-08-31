const listOpportunities = require("./listOpportunities");
const createOpportunity = require("./createOpportunity");
const detailOpportunity = require("./detailOpportunity");
const deleteOpportunity = require("./deleteOpportunity");
const editOpportunity = require("./editOpportunity");
const createFollowup = require("./createFollowup");
const convertToSales = require("./convertToSales");
const getStatus = require("./getStatus");

module.exports = {
  listOpportunities,
  createOpportunity,
  detailOpportunity,
  editOpportunity,
  deleteOpportunity,
  createFollowup,
  convertToSales,
  getStatus,
};
