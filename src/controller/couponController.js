const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const { validateMongoDBId } = require("../utils/validateMongoDB");
const { pageQuery } = require("../utils/pageQuery");
const slugify = require("slugify");
const Joi = require("joi");
const mongoose = require("mongoose");

const couponSchema = Joi.object().keys({
  id: Joi.string().hex().length(24).optional().allow(""),
  name: Joi.string().min(3).max(100).required(),
  code: Joi.string().min(3).max(20).required(),
  startDay: Joi.date().required(),
  endDay: Joi.date().required(),
  discount: Joi.number().min(5).max(100).required(),
  description: Joi.string().optional().allow(""),
});

const getCreateCoupon = (req, res) => {
  res.render("admin/coupon/create", {
    err: req.flash("err"),
    msg: req.flash("msg"),
  });
};

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const result = couponSchema.validate(req.body);
    if (result.error) {
      console.log(result.error);
      req.flash("err", "Thông tin nhập không đúng định dạng !");
      res.redirect("back");
      return;
    }
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    // let initial = req.body.startDay.toString().split("-");
    // let startDay = [initial[2], initial[1], initial[0]].join("-");

    // initial = req.body.endDay.toString().split("-");
    // let endDay = [initial[2], initial[1], initial[0]].join("-");
    const newCoupon = await Coupon.create(req.body);
    req.flash("msg", "Thêm mã giảm giá thành công");
    res.redirect("/coupon/create");
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const getUpdateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  validateMongoDBId(id);
  const ObjectId = mongoose.Types.ObjectId;
  try {
    const coupon = await Coupon.aggregate([
      {
        $match: { _id: new ObjectId(id) },
      },
      {
        $project: {
          name: 1,
          code: 1,
          discount: 1,
          startDay: {
            $dateToString: { format: "%Y/%m/%d", date: "$startDay" },
          },
          endDay: {
            $dateToString: { format: "%Y/%m/%d", date: "$endDay" },
          },
        },
      },
    ]);
    res.render("admin/coupon/update", {
      coupon,
      err: req.flash("err"),
      msg: req.flash("msg"),
    });
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.body;
  validateMongoDBId(id);
  console.log(id);
  try {
    const result = couponSchema.validate(req.body);
    if (result.error) {
      console.log(result.error);
      req.flash("err", "Thông tin nhập không đúng định dạng !");
      res.redirect("back");
      return;
    }
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const updateCoupon = await Coupon.findByIdAndUpdate(id, req.body);
    req.flash("msg", "Sửa mã giảm giá thành công");
    res.redirect("/coupon");
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const deleteCoupon = await Coupon.findByIdAndDelete(id);
    req.flash("msg", "Xóa mã giảm giá thành công");
    res.redirect("/coupon");
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const getAllCoupon = asyncHandler(async (req, res) => {
  try {
    let query = Coupon.aggregate([
      {
        $project: {
          name: 1,
          code: 1,
          discount: 1,
          startDay: {
            $dateToString: { format: "%d/%m/%Y ", date: "$startDay" },
          },
          endDay: {
            $dateToString: { format: "%d/%m/%Y ", date: "$endDay" },
          },
        },
      },
    ]);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit; //(page * limit) - limt

    const num = await Coupon.countDocuments(); //tong so san pham

    query = query.skip(skip).limit(limit);

    const coupons = await query;

    const pages = Math.ceil(num / limit); //tong so trang

    res.render("admin/coupon/list", {
      key: "",
      coupons,
      current: page,
      pages,
      err: req.flash("err"),
      msg: req.flash("msg"),
    });
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const searchCoupon = asyncHandler(async (req, res) => {
  const { key } = req.query;
  try {
    if (key != "") {
      let searchCoupon = await Coupon.aggregate([
        {
          $match: {
            $or: [
              { name: { $regex: key, $options: "i" } },
              { code: { $regex: key, $options: "i" } },
            ],
          },
        },
        {
          $project: {
            name: 1,
            code: 1,
            discount: 1,
            startDay: {
              $dateToString: { format: "%d/%m/%Y ", date: "$startDay" },
            },
            endDay: {
              $dateToString: { format: "%d/%m/%Y ", date: "$endDay" },
            },
          },
        },
      ]);
      if (searchCoupon.length > 0) {
        req.flash(
          "msg",
          "Tìm thấy " + searchCoupon.length + " loại sản phẩm phù hợp"
        );
      } else {
        req.flash("err", "Không tìm thấy loại sản phẩm phù hợp");
      }
      res.render("admin/coupon/list", {
        coupons: searchCoupon,
        key: key,
        pages: 0,
        err: req.flash("err"),
        msg: req.flash("msg"),
      });
    } else {
      req.flash("err", "Chưa nhập giá trị vào thanh tìm kiếm !");
      res.redirect("/coupon");
      return;
    }
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

module.exports = {
  getCreateCoupon,
  createCoupon,
  getUpdateCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupon,
  searchCoupon,
};
