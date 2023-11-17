const express = require("express");
const router = express.Router();
const {
  isAdmin,
  authMiddleware,
  checkSuperAdmin,
} = require("../middlewares/authMiddleware");
const {
  getCreateBrand,
  createBrand,
  getUpdateBrand,
  updateBrand,
  deleteBrand,
  getAllBrand,
  searchBrand,
} = require("../controller/brandController");

router.get("/create", authMiddleware, isAdmin, checkSuperAdmin, getCreateBrand);

router.post("/create", authMiddleware, isAdmin, createBrand);

router.get(
  "/update/:id",
  authMiddleware,
  isAdmin,
  checkSuperAdmin,
  getUpdateBrand
);

router.post("/update", authMiddleware, isAdmin, updateBrand);

router.get("/delete/:id", authMiddleware, isAdmin, deleteBrand);

router.get("/", authMiddleware, isAdmin, checkSuperAdmin, getAllBrand);

router.get("/search", authMiddleware, isAdmin, checkSuperAdmin, searchBrand);

module.exports = router;
