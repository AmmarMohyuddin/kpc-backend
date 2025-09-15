const create = require("./create");
const createLead = require("./createLead");
const listLead = require("./listLead");
const detailLead = require("./detailLead");
const updateLead = require("./updateLead");
const createFollowup = require("./createFollowup");
const listFollowup = require("./listFollowup");
const getStatus = require("./getStatus");
const leadChart = require("./leadChart");
const leadFollowups = require("./leadFollowups");

module.exports = {
  create,
  createLead,
  listLead,
  leadFollowups,
  listFollowup,
  updateLead,
  detailLead,
  createFollowup,
  getStatus,
  leadChart,
};
