const express = require("express");
const router = express.Router();
const {
  isAdmin,
  authMiddleware,
  checkSuperAdmin,
} = require("../middlewares/authMiddleware");
const {
  getCreateUser,
  getUpdateUser,
  createUser,
  loginUser,
  getAllUser,
  deleteAUser,
  updateAUser,
  logOut,
  changePassword,
  loginAdmin,
  saveAddress,
  searchUser,
} = require("../controller/userController");

router.post("/register", createUser);

router.post("/login", loginUser);

router.post("/admin-login", loginAdmin);

router.post("/change-password", authMiddleware, changePassword);

router.get("/logout", authMiddleware, checkSuperAdmin, logOut);

router.put("/saveaddress", authMiddleware, saveAddress);

router.get("/delete/:id", authMiddleware, isAdmin, deleteAUser);

router.get(
  "/update/:id",
  authMiddleware,
  isAdmin,
  checkSuperAdmin,
  getUpdateUser
);

router.post("/update", authMiddleware, updateAUser);

router.get("/create", authMiddleware, isAdmin, checkSuperAdmin, getCreateUser);

router.post("/create", authMiddleware, isAdmin, createUser);

router.get("/", authMiddleware, isAdmin, checkSuperAdmin, getAllUser);

router.get("/search", authMiddleware, isAdmin, checkSuperAdmin, searchUser);

module.exports = router;
