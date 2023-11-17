const express = require("express");
const router = express.Router();
const { loginAdmin } = require("../controller/userController");
const {
  isAdmin,
  authMiddleware,
  checkSuperAdmin,
} = require("../middlewares/authMiddleware");
const {
  getAdminPage,
  getChangeProfile,
  getChangePassword,
} = require("../controller/adminController");

router.get("/", checkSuperAdmin, getAdminPage);

router.post("/login", loginAdmin);

router.get(
  "/change-profile",
  authMiddleware,
  checkSuperAdmin,
  getChangeProfile
);

router.get(
  "/change-password",
  authMiddleware,
  checkSuperAdmin,
  getChangePassword
);

module.exports = router;
