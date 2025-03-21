const express = require("express");
const router = express.Router();
const ensureAuth = require("../../../middleware/authorization");
const {
  list,
  update,
  detail,
  signIn,
  destroy,
  signUp,
  approveUser,
} = require("../../../controllers/api/v1/users");

// // Route Definitions
router.post("/signIn", signIn);
router.post("/signUp", signUp);
router.get("/list", list);
router.put("/update/:id", ensureAuth, update);
router.get("/detail/:id", ensureAuth, detail);
router.delete("/destroy/:id", destroy);
router.put("/approveUser/:id", approveUser);

module.exports = router;
