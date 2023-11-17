const express = require("express");
const router = express.Router();
const {
  isAdmin,
  authMiddleware,
  checkSuperAdmin,
} = require("../middlewares/authMiddleware");
const {
  getAllOrders,
  getOrder,
  updateOrderStatus,
  searchOrder,
  deleteOrder,
  getOrderUpdate,
} = require("../controller/orderController");

router.get("/", authMiddleware, isAdmin, checkSuperAdmin, getAllOrders);

router.get(
  "/update/:id",
  authMiddleware,
  isAdmin,
  checkSuperAdmin,
  getOrderUpdate
);

router.post("/update", authMiddleware, isAdmin, updateOrderStatus);

router.get("/search", authMiddleware, isAdmin, checkSuperAdmin, searchOrder);

router.get("/delete/:id", authMiddleware, isAdmin, deleteOrder);

router.get("/:id", authMiddleware, isAdmin, checkSuperAdmin, getOrder);

module.exports = router;
