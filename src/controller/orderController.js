const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const { validateMongoDBId } = require("../utils/validateMongoDB");
const mongoose = require("mongoose");

const getOrderUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const order = await Order.findById(id)
      .populate("products.product")
      .populate("orderBy")
      .exec();
    res.render("admin/order/update", {
      order,
      err: req.flash("err"),
      msg: req.flash("msg"),
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const order = await Order.findById(id)
      .populate("products.product")
      .populate("orderBy")
      .exec();
    res.render("admin/order/detailOrder", {
      order,
      err: req.flash("err"),
      msg: req.flash("msg"),
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    let query = Order.find().populate("products.product").populate("orderBy");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit; //(page * limit) - limt

    const numOrder = await Order.countDocuments(); //tong so san pham

    query = query.skip(skip).limit(limit);

    const orders = await query;

    const pages = Math.ceil(numOrder / limit); //tong so trang

    res.render("admin/order/list", {
      key: "",
      orders,
      current: page,
      pages,
      err: req.flash("err"),
      msg: req.flash("msg"),
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getOrderByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const userorders = await Order.findOne({ orderby: id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.body;
  validateMongoDBId(id);
  try {
    console.log(req.body);
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: req.body.orderStatus,
        shippingStatus: req.body.shippingStatus,
        paymentIntent: {
          status: req.body.orderStatus,
        },
      },
      { new: true }
    );
    const order = await Order.findById(id);
    const userId = order.orderBy;

    if (
      req.body.orderStatus == "Đã xử lý" &&
      req.body.shippingStatus == "Đã giao hàng"
    ) {
      const newUser = await User.findByIdAndUpdate(userId, {
        moneySpend: order.priceTotal,
      });
    }

    const user = await User.findById(userId);
    const moneySpend = user.moneySpend;
    if (moneySpend > 1000000 || order.priceTotal > 1000000) {
      await User.findByIdAndUpdate(userId, {
        vip: 1,
      });
    } else if (moneySpend > 5000000 || order.priceTotal > 5000000) {
      await User.findByIdAndUpdate(userId, {
        vip: 2,
      });
    } else if (moneySpend > 10000000 || order.priceTotal > 10000000) {
      await User.findByIdAndUpdate(userId, {
        vip: 3,
      });
    }
    let moneySpend_new = moneySpend + order.priceTotal;
    await User.findByIdAndUpdate(userId, {
      moneySpend: moneySpend_new,
    });
    req.flash("msg", "Sửa trạng thái đơn hàng thành công");
    res.redirect("/order");
  } catch (error) {
    throw new Error(error);
  }
});

const searchOrder = asyncHandler(async (req, res) => {
  try {
    const { orderStatus, shippingStatus } = req.query;
    let searchOrder;
    if ((shippingStatus != "") & (orderStatus != "")) {
      searchOrder = await Order.find({
        orderStatus: orderStatus,
        shippingStatus: shippingStatus,
      })
        .populate("products.product")
        .populate("orderBy")
        .exec();
    } else if ((orderStatus != "") & (shippingStatus == "")) {
      searchOrder = await Order.find({
        orderStatus: orderStatus,
      })
        .populate("products.product")
        .populate("orderBy")
        .exec();
    } else if ((orderStatus == "") & (shippingStatus != "")) {
      searchOrder = await Order.find({
        shippingStatus: shippingStatus,
      })
        .populate("products.product")
        .populate("orderBy")
        .exec();
    }
    if (searchOrder.length > 0) {
      req.flash("msg", "Tìm thấy " + searchOrder.length + " đơn hàng phù hợp");
    } else {
      req.flash("err", "Không tìm thấy đơn hàng phù hợp !");
    }
    res.render("admin/order/list", {
      orders: searchOrder,
      pages: 0,
      err: req.flash("err"),
      msg: req.flash("msg"),
    });
  } catch (err) {
    req.flash(
      "err",
      "Chưa chọn trạng thái đơn hàng hoặc trạng thái giao hàng !"
    );
    res.redirect("/order");
    throw new Error(err);
  }
});

const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const deleteCategory = await Order.findByIdAndDelete(id);
    req.flash("msg", "Xóa đơn hàng thành công");
    res.redirect("/order");
  } catch (err) {
    req.flash("err", "Có lỗi xảy ra !");
    res.redirect("back");
    throw new Error(err);
  }
});

module.exports = {
  getOrderUpdate,
  deleteOrder,
  searchOrder,
  updateOrderStatus,
  getAllOrders,
  getOrder,
  updateOrderStatus,
};
