const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");
const { validateMongoDBId } = require("../utils/validateMongoDB");
const { pageQuery } = require("../utils/pageQuery");
const slugify = require("slugify");
const Joi = require("joi");

const categorySchema = Joi.object().keys({
  id: Joi.string().hex().length(24).optional().allow(""),
  name: Joi.string().min(2).max(30).required(),
  note: Joi.string().optional().allow(""),
});

const getCreateCategory = (req, res) => {
  res.render("admin/category/create", {
    err: req.flash("err"),
    msg: req.flash("msg"),
  });
};

const createCategory = asyncHandler(async (req, res) => {
  try {
    const result = categorySchema.validate(req.body);
    if (result.error) {
      req.flash("err", "Thông tin vừa nhập không đúng định dạng !");
      res.redirect("/category/create");
      return;
    }
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const newCategory = await Category.create(req.body);
    req.flash("msg", "Thêm loại sản phẩm thành công");
    res.redirect("/category/create");
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const getUpdateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const category = await Category.findById(id);
    res.render("admin/category/update", {
      category,
      err: req.flash("err"),
      msg: req.flash("msg"),
    });
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.body;
  validateMongoDBId(id);
  try {
    const result = categorySchema.validate(req.body);
    if (result.error) {
      console.log(result.error);
      req.flash("err", "Thông tin vừa nhập không đúng định dạng !");
      res.redirect("back");
      return;
    }
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const updateCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    req.flash("msg", "Sửa loại sản phẩm thành công");
    res.redirect("/category");
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let page = req.query.page || 1;
  validateMongoDBId(id);
  try {
    const deleteCategory = await Category.findByIdAndDelete(id);
    req.flash("msg", "Xóa loại sản phẩm thành công");
    res.redirect("/category");
    //res.render('admin/category/list', { page, err: req.flash('err'), msg: req.flash('msg') });
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const getAllCategory = asyncHandler(async (req, res) => {
  try {
    let query = Category.find();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit; //(page * limit) - limt

    const numCategory = await Category.countDocuments(); //tong so san pham

    query = query.skip(skip).limit(limit);

    const categories = await query;

    const pages = Math.ceil(numCategory / limit); //tong so trang

    res.render("admin/category/list", {
      key: "",
      categories,
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

const searchCategory = asyncHandler(async (req, res) => {
  const { key } = req.query;
  try {
    if (key != "") {
      let searchCategory = await Category.find({
        $or: [
          { name: { $regex: key, $options: "i" } },
          { slug: { $regex: key, $options: "i" } },
          { note: { $regex: key, $options: "i" } },
        ],
      });
      if (searchCategory.length > 0) {
        req.flash(
          "msg",
          "Tìm thấy " + searchCategory.length + " loại sản phẩm phù hợp"
        );
      } else {
        req.flash("err", "Không tìm thấy loại sản phẩm phù hợp");
      }
      res.render("admin/category/list", {
        categories: searchCategory,
        key: key,
        pages: 0,
        err: req.flash("err"),
        msg: req.flash("msg"),
      });
    } else {
      req.flash("err", "Chưa nhập giá trị vào thanh tìm kiếm !");
      res.redirect("/category");
      return;
    }
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

module.exports = {
  getCreateCategory,
  createCategory,
  getUpdateCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
  searchCategory,
};
