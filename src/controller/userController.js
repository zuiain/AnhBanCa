const bcrypt = require("bcrypt");
const Joi = require("joi");
const moment = require("moment");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { generateToken } = require("../config/jsonwebToken");
const { validateMongoDBId } = require("../utils/validateMongoDB");
const { generateRefreshToken } = require("../config/refreshtoken");

const userSchema = Joi.object().keys({
  id: Joi.string().length(24).optional().allow(""),
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().min(10).max(12).required(),
  address: Joi.string().min(3).max(50).required(),
  role: Joi.string().optional().allow(""),
  password: Joi.string()
    .regex(/^[a-zA-Z0-9]{8,30}$/)
    .required(),
  confirmationPassword: Joi.any()
    .valid(Joi.ref("password"))
    .optional()
    .allow(""),
});

//trang quan ly user
//Lay chi tiet 1 User
const getAUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDBId(id);
    const getAUser = await User.findById(id);
    res.json(getAUser);
  } catch (err) {
    throw new Error(err);
  }
});

//Lay danh sach User
const getAllUser = asyncHandler(async (req, res) => {
  try {
    //Lay danh sach user
    let query = User.aggregate([
      {
        $project: {
          name: 1,
          address: 1,
          email: 1,
          mobile: 1,
          role: 1,
          createdAt: {
            $dateToString: { format: "%H:%M - %d/%m/%Y ", date: "$createdAt" },
          },
        },
      },
    ]);

    //Phan Trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit; //(page * limit) - limt

    query = query.skip(skip).limit(limit);

    const users = await query;

    const numUser = await User.countDocuments();

    const pages = Math.ceil(numUser / limit);

    res.render("admin/user/list", {
      role: "",
      key: "",
      users,
      current: page,
      pages,
      msg: req.flash("msg"),
      err: req.flash("err"),
    });
  } catch (err) {
    throw new Error(err);
  }
});

//goi trang cap nhat
const getUpdateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const user = await User.findById(id);
    res.render("admin/user/update", {
      user: user,
      msg: req.flash("msg"),
      err: req.flash("err"),
    });
  } catch (error) {
    throw new Error(err);
  }
});

//Cap nhat User
const updateAUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;
    validateMongoDBId(id);
    const updateAUser = await User.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        address: req.body.address,
      },
      {
        new: true,
      }
    );
    if (updateAUser != null) {
      req.flash("msg", "Sửa thông tin tài khoản thành công");
      res.redirect("back");
    } else {
      req.flash("err", "Có lỗi xảy ra");
      res.redirect("back");
    }
  } catch (err) {
    throw new Error(err);
  }
});

//tim kiem user
const searchUser = asyncHandler(async (req, res) => {
  const { key, role } = req.query;
  let searchUser;
  try {
    if (key == "") {
      if (role != "") {
        searchUser = await User.find({
          role: req.query.role,
        });
      } else {
        req.flash("err", "Chưa nhập giá trị vào thanh tìm kiếm !");
        res.redirect("/user");
        return;
      }
    } else {
      if (req.query.role != "") {
        searchUser = await User.find({
          role: role,
          $or: [
            { slug: { $regex: key, $options: "i" } },
            { name: { $regex: key, $options: "i" } },
            { number: { $regex: key, $options: "i" } },
            { address: { $regex: key, $options: "i" } },
            { email: { $regex: key, $options: "i" } },
          ],
        });
      } else {
        searchUser = await User.find({
          $or: [
            { slug: { $regex: key, $options: "i" } },
            { name: { $regex: key, $options: "i" } },
            { number: { $regex: key, $options: "i" } },
            { address: { $regex: key, $options: "i" } },
            { email: { $regex: key, $options: "i" } },
          ],
        });
      }
    }
    if (searchUser.length > 0) {
      req.flash("msg", "Tìm thấy " + searchUser.length + " thành viên phù hợp");
    } else {
      req.flash("err", "Không tìm thấy thành viên phù hợp");
    }
    res.render("admin/user/list", {
      users: searchUser,
      key: key,
      role: role,
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

//Xoa 1 User
const deleteAUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDBId(id);
    const deleteAUser = await User.findByIdAndDelete(id);
    req.flash("msg", "Xóa thành công thông tin thành viên");
    res.redirect("back");
  } catch (err) {
    throw new Error(err);
  }
});

//goi trang tao user
const getCreateUser = (req, res) => {
  res.render("admin/user/create", {
    err: req.flash("err"),
    msg: req.flash("msg"),
  });
};

//Dang ky
const createUser = asyncHandler(async (req, res) => {
  try {
    const result = userSchema.validate(req.body);
    if (result.error) {
      console.log(result.error);
      req.flash("err", "Nhập thông tin không đúng định dạng");
      res.redirect("back");
    }
    const user = await User.findOne({ email: result.value.email });
    if (user) {
      req.flash("err", "Email đã được đăng ký!");
      res.redirect("back");
    } else {
      const newUser = await User.create(req.body);
      if (newUser) {
        req.flash("msg", "Tạo tài khoản thành công");
        res.redirect("back");
      }
    }
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

//Dang nhap
const loginUser = asyncHandler(async (req, res) => {
  // res.clearCookie("refreshToken", {
  //   httpOnly: true,
  //   secure: true,
  // });
  // res.redirect("back");
  if (req.cookies.refreshToken) {
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    if (user) {
      req.flash("err", "Bạn đã đăng nhập !");
      res.redirect("/");
      return;
      app;
    }
  } else {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      req.flash("err", "Email không chính xác !");
      res.redirect("back");
      return;
    } else {
      const validPassword = await bcrypt.compare(password, findUser.password);
      if (validPassword == true) {
        const refreshToken = await generateRefreshToken(findUser._id);
        const user = await User.findByIdAndUpdate(
          findUser._id,
          {
            refreshToken: refreshToken,
          },
          {
            new: true,
          }
        );
        //them cookie
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: "strict",
        });
        req.flash("msg", "Đăng nhập thành công");
        if (user.role.toString() === "superAdmin") {
          res.redirect("/admin");
          return;
        }
        if (user.role.toString() === "admin") {
          res.redirect("/admin");
          return;
        }
        res.redirect("/");
      } else {
        req.flash("err", "Mật khẩu không chính xác !");
        res.redirect("back");
      }
    }
  }
});

//Dang nhap boi admin
const loginAdmin = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (cookie.refreshToken) {
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken: refreshToken });
    if (user) {
      req.flash("err", "Bạn đã đăng nhập");
      res.redirect("back");
      return;
    }
  } else {
    const { email, password } = req.body;
    const findAdmin = await User.findOne({ email: email });
    if (!findAdmin) {
      req.flash("err", "Email nhập không chính xác !");
      res.render("admin/login", {
        err: req.flash("err"),
        msg: req.flash("msg"),
      });
      return;
    }
    console.log(findAdmin.role);
    if (findAdmin.role != "superAdmin") {
      if (findAdmin.role != "admin") {
        req.flash("err", "Thành viên không phải là admin trang web !");
        res.redirect("back");
        return;
      }
    } else {
      const validPassword = await bcrypt.compare(password, findAdmin.password);
      if (validPassword == true) {
        const refreshToken = await generateRefreshToken(findAdmin._id);
        const user = await User.findByIdAndUpdate(
          findAdmin._id,
          {
            refreshToken: refreshToken,
          },
          {
            new: true,
          }
        );
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: "strict",
        });
        req.flash("msg", "Đăng nhập thành công");
        res.redirect("/admin");
      } else {
        req.flash("err", "Mật khẩu không chính xác");
        res.redirect("back");
      }
    }
  }
});

// const handleRefreshToken = asyncHandler(async (req, res) => {
//     const cookie = req.cookies;
//     if (!cookie?.refreshToken) throw new Error("Khong co token moi trong cookie");
//     const refreshToken = cookie.refreshToken;
//     const user = await User.findOne({ refreshToken });
//     if (!user) throw new Error("Token moi khong co trong CSDL");
//     generateToken.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
//       if (err || user.id !== decoded.id) {
//         throw new Error("Token moi co loi");
//       }
//       const accessToken = generateToken(user?._id);
//       res.json({ accessToken });
//     });
// });

//Dang xuat
const logOut = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie.refreshToken) {
    req.flash("err", "Không có token trong cookie !");
    res.redirect("/");
    return;
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    req.flash("err", "Token bị lỗi hoặc không đúng");
    res.redirect("/");
    return;
  }
  await User.findByIdAndUpdate(user._id, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  req.flash("msg", "Đăng xuất thành công");
  res.redirect("/");
});

//Thay doi mat khau
const changePassword = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie.refreshToken) throw new Error("Khong co token trong cookie");
  const refreshToken = cookie.refreshToken;
  const findUser = await User.findOne({ refreshToken: refreshToken });
  if (findUser) {
    const { oldPassword } = req.body;
    const { newPassword } = req.body;
    const validPassword = await bcrypt.compare(oldPassword, findUser.password);
    if (validPassword) {
      findUser.password = newPassword;
      const updatedPassword = await findUser.save();
      req.flash("msg", "Đổi mật khẩu thành công");
      res.redirect("back");
    } else {
      req.flash("err", "Nhập không đúng mật khẩu cũ!");
    }
  } else {
    throw new Error("Khong tim thay User");
  }
});

//luu dia chi giao hang
const saveAddress = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  const refreshToken = cookie.refreshToken;
  const findUser = await User.findOne({ refreshToken: refreshToken });
  if (!findUser) throw new Error("Token bi loi hoac khong dung");
  try {
    const updateUser = await User.findByIdAndUpdate(
      findUser._id,
      {
        address: req.body.address,
      },
      {
        new: true,
      }
    );
    res.json(updateUser);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  searchUser,
  getCreateUser,
  getUpdateUser,
  createUser,
  loginUser,
  getAllUser,
  getAUser,
  deleteAUser,
  updateAUser,
  logOut,
  changePassword,
  loginAdmin,
  saveAddress,
};
