const express = require("express");
const router = express.Router();
const {
  isAdmin,
  authMiddleware,
  checkSuperAdmin,
} = require("../middlewares/authMiddleware");
const {
  getCreateCategory,
  createCategory,
  getUpdateCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
  searchCategory,
} = require("../controller/categoryController");

router.get(
  "/create",
  authMiddleware,
  isAdmin,
  checkSuperAdmin,
  getCreateCategory
);

router.post("/create", authMiddleware, isAdmin, createCategory);

router.get(
  "/update/:id",
  authMiddleware,
  isAdmin,
  checkSuperAdmin,
  getUpdateCategory
);

router.post("/update", authMiddleware, isAdmin, updateCategory);

router.get("/delete/:id", authMiddleware, isAdmin, deleteCategory);

router.get("/search", authMiddleware, isAdmin, checkSuperAdmin, searchCategory);

router.get("/", authMiddleware, isAdmin, checkSuperAdmin, getAllCategory);

module.exports = router;
