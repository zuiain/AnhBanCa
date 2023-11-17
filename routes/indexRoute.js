const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const { getData } = require("../middlewares/getData");
const {
  changePassword,
  loginUser,
  logOut,
} = require("../controller/userController");
const {
  createUser,
  createOrder,
  getWishList,
  addToWishList,
  addToCart,
  getChangePassword,
  getHomePage,
  getLoginPage,
  getRegisterPage,
  getDetailProduct,
  getCart,
  getDeleteCart,
  applyCoupon,
  getSearch,
  getDeleteWishlist,
  getUpdateUser,
  updateCount,
  changeProfile,
  rating,
  getBlog,
  getSingleBlog,
  getContact,
} = require("../controller/indexController");

router.post("/login", loginUser);

router.post("/register", createUser);

router.get("/", getData, getHomePage);

router.get("/san-pham/:slug", getData, getDetailProduct);

router.get("/dang-nhap", getData, getLoginPage);

router.get("/tim-kiem", getData, getSearch);

router.get("/dang-ky", getData, getRegisterPage);

router.get("/tai-khoan", getData, getUpdateUser);

router.get("/logout", authMiddleware, logOut);

router.get("/doi-mat-khau", authMiddleware, getData, getChangePassword);

router.get("/ua-thich", authMiddleware, getData, getWishList);

router.get("/add-to-wishlist/:id", addToWishList);

router.get("/gio-hang", authMiddleware, getData, getCart);

router.delete("/delete-cart/:id", authMiddleware, getDeleteCart);

router.get("/delete-wishlist/:id", authMiddleware, getDeleteWishlist);

router.post("/apply-coupon", authMiddleware, applyCoupon);

router.post("/change-password", authMiddleware, changePassword);

router.post("/add-to-cart", addToCart);

router.post("/update-count", authMiddleware, updateCount);

router.put("/update-user/:id", authMiddleware, changeProfile);

router.post("/create-order", authMiddleware, createOrder);

router.post("/rating", authMiddleware, rating);

router.get("/bai-viet", getData, getBlog);

router.get("/bai-viet/:slug", getData, getSingleBlog);

router.get("/lien-he", getData, getContact);

module.exports = router;
