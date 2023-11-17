const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const { validateMongoDBId } = require("../utils/validateMongoDB");
const { pageQuery } = require("../utils/pageQuery");
const slugify = require("slugify");
const Joi = require("joi");

const brandSchema = Joi.object().keys({
  id: Joi.string().hex().length(24).optional().allow(""),
  name: Joi.string().min(3).max(100).required(),
  origin: Joi.string().min(1).max(100).optional().allow(""),
  note: Joi.string().optional().allow(""),
});

const getCreateBrand = (req, res) => {
  res.render("admin/brand/create", {
    err: req.flash("err"),
    msg: req.flash("msg"),
  });
};

const createBrand = asyncHandler(async (req, res) => {
  try {
    const result = brandSchema.validate(req.body);
    if (result.error) {
      console.log(result.error);
      req.flash("err", "Thông tin nhập không đúng định dạng !");
      res.redirect("back");
      return;
    }
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const newBrand = await Brand.create(req.body);
    req.flash("msg", "Thêm hãng thành công");
    res.redirect("/brand/create");
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const getUpdateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const brand = await Brand.findById(id);
    res.render("admin/brand/update", {
      brand,
      err: req.flash("err"),
      msg: req.flash("msg"),
    });
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.body;
  validateMongoDBId(id);
  try {
    const result = brandSchema.validate(req.body);
    if (result.error) {
      console.log(result.error);
      req.flash("err", "Thông tin nhập không đúng định dạng !");
      res.redirect("back");
      return;
    }
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const updateBrand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    req.flash("msg", "Sửa hãng thành công");
    res.redirect("/brand");
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const deleteBrand = await Brand.findByIdAndDelete(id);
    req.flash("msg", "Xóa hãng thành công");
    res.redirect("/brand");
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const getAllBrand = asyncHandler(async (req, res) => {
  try {
    let query = Brand.find();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit; //(page * limit) - limt

    const num = await Brand.countDocuments(); //tong so san pham

    query = query.skip(skip).limit(limit);

    const brands = await query;

    const pages = Math.ceil(num / limit); //tong so trang

    res.render("admin/brand/list", {
      key: "",
      brands,
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

const searchBrand = asyncHandler(async (req, res) => {
  const { key } = req.query;
  try {
    if (key != "") {
      let searchBrand = await Brand.find({
        $or: [
          { name: { $regex: key, $options: "i" } },
          { origin: { $regex: key, $options: "i" } },
          { note: { $regex: key, $options: "i" } },
        ],
      });
      if (searchBrand.length > 0) {
        req.flash(
          "msg",
          "Tìm thấy " + searchBrand.length + " loại sản phẩm phù hợp"
        );
      } else {
        req.flash("err", "Không tìm thấy loại sản phẩm phù hợp");
      }
      res.render("admin/brand/list", {
        brands: searchBrand,
        key: key,
        pages: 0,
        err: req.flash("err"),
        msg: req.flash("msg"),
      });
    } else {
      req.flash("err", "Chưa nhập giá trị vào thanh tìm kiếm !");
      res.redirect("/brand");
      return;
    }
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

module.exports = {
  getCreateBrand,
  createBrand,
  getUpdateBrand,
  updateBrand,
  deleteBrand,
  getAllBrand,
  searchBrand,
};
