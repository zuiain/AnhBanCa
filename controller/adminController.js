const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const express = require("express");
const app = express();

const getAdminPage = asyncHandler(async (req, res) => {
  try {
    if (req.cookies.refreshToken) {
      const user = await User.findOne({
        refreshToken: req.cookies.refreshToken,
      });
      if (user.role != "superAdmin") {
        if (user.role != "admin") {
          req.flash("err", "Đường dẫn không đúng !");
          res.redirect("back");
        }
      }
      res.render("admin/index", {
        user,
        msg: req.flash("msg"),
        err: req.flash("err"),
      });
    } else {
      res.render("admin/login");
    }
  } catch (err) {
    throw new Error(err);
  }
});

const getChangeProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
  res.render("admin/user/update", {
    user,
    msg: req.flash("msg"),
    err: req.flash("err"),
  });
});

const getChangePassword = asyncHandler(async (req, res) => {
  res.render("admin/user/changePassword", {
    msg: req.flash("msg"),
    err: req.flash("err"),
  });
});

module.exports = {
  getChangePassword,
  getChangeProfile,
  getAdminPage,
};
