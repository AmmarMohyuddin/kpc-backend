const express = require("express");
const router = express.Router();

const {
  listing,
  update,
  detail,
} = require("../../../controllers/api/v1/notifications");

router.get("/listNotifications", listing);
router.post("/updateNotification", update);
router.get("/detailNotification", detail);

module.exports = router;
