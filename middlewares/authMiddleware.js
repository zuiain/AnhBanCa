const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// Kiểm tra đăng nhập
const authMiddleware = asyncHandler(async (req, res, next) => {
  const cookie = req.cookies;
  if (!cookie.refreshToken) {
    req.flash("Bạn cần đăng nhập để thực hiện thao tác này");
    res.redirect("/");
  } else {
    next();
  }
});

// Kiểm tra xem có phải admin
const isAdmin = asyncHandler(async (req, res, next) => {
  const findUser = await User.findOne({
    refreshToken: req.cookies.refreshToken,
  });
  if (!findUser) {
    req.flash("err", "Không tìm thấy tài khoản thành viên !");
    res.redirect("back");
    return;
  }
  if (findUser.role !== "admin") {
    if (findUser.role !== "superAdmin") {
      res.status(404);
      res.render("index/404.ejs");
      next(error);
    }
  }
  next();
});

// kiểm tra xem có phải super admin
const checkSuperAdmin = asyncHandler(async (req, res, next) => {
  if (req.cookies.refreshToken) {
    const findUser = await User.findOne({
      refreshToken: req.cookies.refreshToken,
    });
    if (findUser.role != "superAdmin") {
      res.locals.superAdmin = false;
    } else {
      res.locals.superAdmin = true;
    }
  }
  next();
});

module.exports = { authMiddleware, isAdmin, checkSuperAdmin };
