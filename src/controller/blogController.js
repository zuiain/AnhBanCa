const Blog = require("../models/blogModel");
const asyncHandler = require("express-async-handler");
const { validateMongoDBId } = require("../utils/validateMongoDB");
const { pageQuery } = require("../utils/pageQuery");
const slugify = require("slugify");
const { cloudinaryUploadImg } = require("../utils/cloudinary");
const Joi = require("joi");

const blogSchema = Joi.object().keys({
  id: Joi.string().length(24).optional().allow(""),
  title: Joi.string().min(2).max(100).required(),
  category: Joi.string().required(),
  content: Joi.string().required(),
  body: Joi.string().required(),
  numViews: Joi.number().optional().allow(""),
});

const getCreateBlog = (req, res) => {
  res.render("admin/blog/create", {
    err: req.flash("err"),
    msg: req.flash("msg"),
  });
};

const createBlog = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    const result = blogSchema.validate(req.body);
    if (result.error) {
      console.log(result.error);
      req.flash("err", "Thông tin vừa nhập không đúng định dạng !");
      res.redirect("/blog/create");
      return;
    }

    if (!req.file) {
      req.flash("err", "Chưa chọn file ảnh !");
      res.redirect("back");
      return;
    } else {
      const result = await cloudinaryUploadImg(req.file.path);
      req.body.imgUrl = result.url;
    }
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newBlog = await Blog.create(req.body);
    req.flash("msg", "Thêm bài viết thành công");
    res.redirect("/blog/create");
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const getUpdateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const blog = await Blog.findById(id);
    res.render("admin/blog/update", {
      blog,
      err: req.flash("err"),
      msg: req.flash("msg"),
    });
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.body;
  console.log(id);
  validateMongoDBId(id);
  try {
    const result = blogSchema.validate(req.body);
    if (result.error) {
      console.log(result.error);
      req.flash("err", "Thông tin vừa nhập không đúng định dạng !");
      res.redirect("back");
      return;
    }
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    req.flash("msg", "Sửa bài viết thành công");
    res.redirect("/blog");
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let page = req.query.page || 1;
  validateMongoDBId(id);
  try {
    const deleteBlog = await Blog.findByIdAndDelete(id);
    req.flash("msg", "Xóa bài viết thành công");
    res.redirect("/blog");
    //res.render('admin/blog/list', { page, err: req.flash('err'), msg: req.flash('msg') });
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

const getAllBlog = asyncHandler(async (req, res) => {
  try {
    let query = Blog.find();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit; //(page * limit) - limt

    const numBlog = await Blog.countDocuments(); //tong so san pham

    query = query.skip(skip).limit(limit);

    const blogs = await query;

    const pages = Math.ceil(numBlog / limit); //tong so trang

    res.render("admin/blog/list", {
      category: "",
      key: "",
      blogs,
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

const searchBLog = asyncHandler(async (req, res) => {
  const { key, category } = req.query;
  let searchBlog;
  try {
    if (key == "") {
      if (category != "") {
        searchBlog = await Blog.find({
          category: req.query.category,
        });
      } else {
        req.flash("err", "Chưa nhập giá trị vào thanh tìm kiếm !");
        res.redirect("/blog");
        return;
      }
    } else {
      if (req.query.category != "") {
        searchBlog = await Blog.find({
          category: category,
          $or: [
            { name: { $regex: key, $options: "i" } },
            { slug: { $regex: key, $options: "i" } },
            { note: { $regex: key, $options: "i" } },
          ],
        });
      } else {
        searchBlog = await Blog.find({
          $or: [
            { name: { $regex: key, $options: "i" } },
            { slug: { $regex: key, $options: "i" } },
            { note: { $regex: key, $options: "i" } },
          ],
        });
      }
    }
    if (searchBlog.length > 0) {
      req.flash("msg", "Tìm thấy " + searchBlog.length + " bài viết phù hợp");
    } else {
      req.flash("err", "Không tìm thấy bài viết phù hợp");
    }
    res.render("admin/blog/list", {
      blogs: searchBlog,
      key: key,
      category: category,
      pages: 0,
      err: req.flash("err"),
      msg: req.flash("msg"),
    });
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

//sua anh
const getUpdateImg = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  {
    try {
      const blog = await Blog.findById(id);
      res.render("admin/blog/updateImg", {
        blog,
        msg: req.flash("msg"),
        err: req.flash("err"),
      });
    } catch (err) {
      req.flash("err", "Có lỗi xảy ra!");
      res.redirect("back");
      throw new Error(err);
    }
  }
});

//sua anh
const updateImg = asyncHandler(async (req, res) => {
  const { id } = req.body;
  let imgUrl;
  try {
    if (!req.file) {
      req.flash("err", "Chưa chọn file ảnh !");
      res.redirect("back");
      return;
    } else {
      const result = await cloudinaryUploadImg(req.file.path);
      imgUrl = result.url;
      console.log(imgUrl);
    }
    const blog = await Blog.findByIdAndUpdate(
      id,
      { imgUrl: imgUrl },
      {
        new: true,
      }
    );
    if (blog !== null) {
      req.flash("msg", "Sửa ảnh thành công ");
      res.redirect("/blog");
    } else {
      req.flash("msg", "Có lỗi xảy ra !");
      res.redirect("back");
    }
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  getCreateBlog,
  createBlog,
  getUpdateBlog,
  updateBlog,
  deleteBlog,
  getAllBlog,
  searchBLog,
  getUpdateImg,
  updateImg,
};
