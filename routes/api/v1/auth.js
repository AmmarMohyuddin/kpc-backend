const express = require("express");
const router = express.Router();
const {
  ocilogin,
  ocicallback,
  ocilogout,
  ocisession,
} = require("../../../controllers/api/v1/auth");

// OCI Authentication Routes
router.get("/oci/login", ocilogin);
router.get("/oci/callback", ocicallback);
router.get("/oci/logout", ocilogout);
router.get("/oci/session", ocisession);

module.exports = router;
