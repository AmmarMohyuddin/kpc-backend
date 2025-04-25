const signUp = require("./signUp");
const signIn = require("./signIn");
const list = require("./list");
const detail = require("./detail");
const update = require("./update");
const destroy = require("./destroy");
const approveUser = require("./approveUser");
const deactivate = require("./deactivate");
const deactivateUsersList = require("./deactivateUsersList");

module.exports = {
  signUp,
  signIn,
  list,
  detail,
  update,
  destroy,
  approveUser,
  deactivate,
  deactivateUsersList,
};
