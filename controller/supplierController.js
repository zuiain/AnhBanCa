const Supplier = require("../models/supplierModel");
const asyncHandler = require("express-async-handler");
const { validateMongoDBId } = require("../utils/validateMongoDB");
const { pageQuery } = require("../utils/pageQuery");
const slugify = require("slugify");
const Joi = require("joi");

const supplierSchema = Joi.object().keys({
  id: Joi.string().hex().length(24).optional().allow(""),
  name: Joi.string().min(3).max(200).required(),
  slug: Joi.string().optional().allow(""),
  email: Joi.string().email().optional().allow(""),
  mobile: Joi.string().min(10).max(12).required(),
  address: Joi.string().min(3).max(200).required(),
  fax: Joi.string().optional().allow(""),
  note: Joi.string().optional().allow(""),
});

const getCreateSupplier = (req, res) => {
  res.render("admin/supplier/create", {
    err: req.flash("err"),
    msg: req.flash("msg"),
  });
};

const createSupplier = asyncHandler(async (req, res) => {
  try {
    const result = supplierSchema.validate(req.body);
    if (result.error) {
      console.log(err);
      req.flash("err", "Thông tin nhập không đúng định dạng !");
      res.redirect("back");
      return;
    }
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const newSupplier = await Supplier.create(req.body);
    req.flash("msg", "Thêm nhà cung cấp thành công");
    res.redirect("/supplier/create");
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const getUpdateSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const supplier = await Supplier.findById(id);
    res.render("admin/supplier/update", {
      supplier,
      err: req.flash("err"),
      msg: req.flash("msg"),
    });
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const updateSupplier = asyncHandler(async (req, res) => {
  const { id } = req.body;
  validateMongoDBId(id);
  try {
    const result = supplierSchema.validate(req.body);
    if (result.error) {
      console.log(result.error);
      req.flash("err", "Thông tin nhập không đúng định dạng !");
      res.redirect("back");
      return;
    }
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const updateSupplier = await Supplier.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    req.flash("msg", "Sửa nhà cung cấp thành công");
    res.redirect("/supplier");
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    throw new Error(err);
  }
});

const deleteSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const deleteSupplier = await Supplier.findByIdAndDelete(id);
    req.flash("msg", "Xóa nhà cung cấp thành công");
    res.redirect("/supplier");
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const getAllSupplier = asyncHandler(async (req, res) => {
  try {
    let query = Supplier.find();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit; //(page * limit) - limt

    const num = await Supplier.countDocuments(); //tong so san pham

    query = query.skip(skip).limit(limit);

    const suppliers = await query;

    const pages = Math.ceil(num / limit); //tong so trang

    res.render("admin/supplier/list", {
      key: "",
      suppliers,
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

const searchSupplier = asyncHandler(async (req, res) => {
  const { key } = req.query;
  try {
    if (key != "") {
      let searchSupplier = await Supplier.find({
        $or: [
          { slug: { $regex: key, $options: "i" } },
          { name: { $regex: key, $options: "i" } },
          { number: { $regex: key, $options: "i" } },
          { address: { $regex: key, $options: "i" } },
          { email: { $regex: key, $options: "i" } },
        ],
      });
      if (searchSupplier.length > 0) {
        req.flash(
          "msg",
          "Tìm thấy " + searchSupplier.length + " nhà cung cấp phù hợp"
        );
      } else {
        req.flash("err", "Không tìm thấy nhà cung cấp phù hợp");
      }
      res.render("admin/supplier/list", {
        key: key,
        suppliers: searchSupplier,
        pages: 0,
        err: req.flash("err"),
        msg: req.flash("msg"),
      });
    } else {
      req.flash("err", "Chưa nhập giá trị vào thanh tìm kiếm !");
      res.redirect("/supplier");
      return;
    }
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

module.exports = {
  getCreateSupplier,
  createSupplier,
  getUpdateSupplier,
  updateSupplier,
  deleteSupplier,
  getAllSupplier,
  searchSupplier,
};
