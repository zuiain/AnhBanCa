const uniqid = require('uniqid');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Brand = require('../models/brandModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');
const Blog = require('../models/blogModel');
const { validateMongoDBId } = require('../utils/validateMongoDB');
const asyncHandler = require('express-async-handler');
const { fillterQuery, sortQuery, limitQuery, pageQuery } = require('../utils/pageQuery');
const Joi = require('joi');

const userSchema = Joi.object().keys({
    id: Joi.string().length(24).optional().allow(''),
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    mobile: Joi.string().min(10).max(12).required(),
    address: Joi.string().min(3).max(50).required(),
    role: Joi.string().optional().allow(''),
    password: Joi.string()
        .regex(/^[a-zA-Z0-9]{8,30}$/)
        .required(),
    confirmationPassword: Joi.any().valid(Joi.ref('password')).optional().allow(''),
});

const createUser = asyncHandler(async (req, res) => {
    const result = userSchema.validate(req.body);
    if (result.error) {
        console.log(result.error);
        req.flash('err', 'Nhập thông tin không đúng định dạng');
        res.redirect('back');
    }
    const user = await User.findOne({ email: result.value.email });
    if (user) {
        req.flash('err', 'Email đã được đăng ký!');
        res.redirect('back');
    } else {
        delete result.value.confirmationPassword;
        const newUser = await User.create(req.body);
        req.flash('msg', 'Đăng ký thành công');
        res.redirect('/dang-nhap');
    }
});

//tim kiem
const getSearch = asyncHandler(async (req, res) => {
    const { key } = req.query;
    if (key != '') {
        try {
            let products = await Product.find({
                $or: [
                    { brand: { $regex: key, $options: 'i' } },
                    { category: { $regex: key, $options: 'i' } },
                    { slug: { $regex: key, $options: 'i' } },
                    { name: { $regex: key, $options: 'i' } },
                    { codeProd: { $regex: key, $options: 'i' } },
                ],
            });
            console.log(products.length);
            if (products.length > 0) {
                req.flash('msg', 'Tìm thấy ' + products.length + ' sản phẩm phù hợp');

                const categories = await Category.find();
                const brands = await Brand.find();
                res.render('index/home', {
                    pages: 0,
                    products,
                    categories,
                    brands,
                    msg: req.flash('msg'),
                    err: req.flash('err'),
                });
            } else {
                req.flash('err', 'Không tìm thấy sản phẩm phù hợp !');
                res.redirect('/');
                return;
            }
        } catch (err) {
            throw new Error(err);
        }
    } else {
        req.flash('err', 'Chưa nhập giá trị vào ô tìm kiếm !');
        res.redirect('back');
        return;
    }
});

//goi trang chu
const getHomePage = asyncHandler(async (req, res) => {
    let products;
    const queryObj = { ...req.query };
    //Loc chuoi query
    const queryStr = fillterQuery(req, res);

    //Lay danh sach san pham
    products = await Product.find(JSON.parse(queryStr));

    if (products.length == 0) {
        req.flash('msg', 'Chưa có sản phẩm theo danh mục này !');
    }
    //dem tong san pham va tong so trang
    const numProduct = products.length;

    //Phan Trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit; //(page * limit) - limit
    const pages = Math.ceil(numProduct / limit);

    products = await Product.find(JSON.parse(queryStr)).skip(skip).limit(limit);

    // let fullUrl;
    // if (Object.keys(queryObj).length === 0) {
    //   fullUrl = "";
    // } else {
    //   fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
    // }

    let category = '';
    let brand = '';
    if (req.query.category) {
        category = req.query.category;
    }
    if (req.query.brand) {
        brand = req.query.brand;
    }

    res.render('index/home', {
        category,
        brand,
        products,
        current: page,
        pages,
        msg: req.flash('msg'),
        err: req.flash('err'),
    });
});

//xem chi tiet san pham
const getDetailProduct = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    try {
        const product = await Product.findOne({ slug: slug }).populate('ratings.postedby');
        //const moTa = new JSDOM(product.description);
        const categories = await Category.find();
        const brands = await Brand.find();
        const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
        res.render('index/viewProduct', {
            user,
            brands,
            product,
            categories,
            msg: req.flash('msg'),
            err: req.flash('err'),
        });
    } catch (err) {
        throw new Error(err);
    }
});

//goi trang dang nhap
const getLoginPage = asyncHandler(async (req, res) => {
    res.render('index/login', {
        msg: req.flash('msg'),
        err: req.flash('err'),
    });
});

//goi trang dang ky
const getRegisterPage = asyncHandler(async (req, res) => {
    res.render('index/register', {
        msg: req.flash('msg'),
        err: req.flash('err'),
    });
});

//goi trang sua thong tin tai khoan
const getUpdateUser = asyncHandler(async (req, res) => {
    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken,
    });
    res.render('index/updateUser', {
        user,
        msg: req.flash('msg'),
        err: req.flash('err'),
    });
});

//doi thong tin tai khoan
const changeProfile = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
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
            },
        );
        if (updateAUser != null) {
            req.flash('msg', 'Sửa thành công thông tin tài khoản');
            res.redirect('/');
        } else {
            req.flash('err', 'Có lỗi xảy ra');
            res.redirect('back');
        }
    } catch (err) {
        throw new Error(err);
    }
});

//goi trang doi mat khau
const getChangePassword = asyncHandler(async (req, res) => {
    res.render('index/changePassword', {
        msg: req.flash('msg'),
        err: req.flash('err'),
    });
});

//danh gia sao va binh luan
const rating = asyncHandler(async (req, res) => {
    const findUser = await User.findOne({
        refreshToken: req.cookies.refreshToken,
    });
    if (!findUser) throw new Error('Token bi loi hoac khong dung');
    const { star, prodId, comment } = req.body;
    if (star == '') {
        req.flash('err', 'Chưa lựa chọn sao cho sản phẩm!');
        res.redirect('back');
        return;
    } else {
        try {
            const product = await Product.findById(prodId);
            let alreadyRated = product.ratings.find((rating) => rating.postedby.toString() === findUser._id.toString());
            if (alreadyRated) {
                const updateRating = await Product.updateOne(
                    {
                        ratings: { $elemMatch: alreadyRated },
                    },
                    {
                        $set: { 'ratings.$.star': star, 'ratings.$.comment': comment },
                    },
                    {
                        new: true,
                    },
                );
            } else {
                const rateProduct = await Product.findByIdAndUpdate(
                    prodId,
                    {
                        $push: {
                            ratings: {
                                star: star,
                                comment: comment,
                                postedby: findUser._id,
                            },
                        },
                    },
                    {
                        new: true,
                    },
                );
            }

            //Tinh tong so sao san pham
            const _product = await Product.findById(prodId);
            let totalRating = _product.ratings.length;
            let ratingsum = _product.ratings.map((item) => item.star).reduce((acc, curr) => acc + curr, 0);
            let actualRating = Math.round(ratingsum / totalRating);
            let finalProduct = await Product.findByIdAndUpdate(prodId, { totalRating: actualRating }, { new: true });
            req.flash('msg', 'Đánh giá sản phẩm thành công');
            res.redirect('back');
        } catch (err) {
            throw new Error(err);
        }
    }
});

//tao gio hang
const userCart = asyncHandler(async (req, res, user, cart) => {
    try {
        //them gio hang vao user
        await User.findOneAndUpdate({ _id: user._id }, { cart: cart }, { new: true });
        // Ktra xem ng dung co gio hang chua, co r xoa di de luu cai moi
        const alreadyExistCart = await Cart.findOne({ orderBy: user._id });
        if (alreadyExistCart !== null) {
            await Cart.findOneAndDelete({ orderBy: user._id });
        }
        //them san pham vao gio hang
        let products = [];
        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            let getPrice = await Product.findById(cart[i]._id);
            object.price = getPrice.exPrice;
            products.push(object);
        }
        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal = cartTotal + products[i].price * products[i].count;
        }

        let userDiscount;
        if (user.vip == 1) {
            userDiscount = 5;
        } else if (user.vip == 2) {
            userDiscount = 10;
        } else if (user.vip == 3) {
            userDiscount = 20;
        }
        let totalAfterUserDiscount;
        if (userDiscount > 0) {
            totalAfterUserDiscount = (cartTotal - (cartTotal * userDiscount) / 100).toFixed(2);
        }
        let newCart = await new Cart({
            products,
            cartTotal,
            totalAfterUserDiscount,
            orderBy: user?._id,
            userDiscount,
        }).save();
        return newCart;
    } catch (error) {
        throw new Error(error);
    }
});

//them gio hang
const addToCart = asyncHandler(async (req, res) => {
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    console.log(user);
    if (user == null) {
        req.flash('err', 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');
        res.redirect('/dang-nhap');
    } else {
        try {
            let cart = [];
            const product = {
                _id: req.body.id,
                count: req.body.count || 1,
            };

            const user = await User.findOne({
                refreshToken: req.cookies.refreshToken,
            });

            //lay gio hang tu user
            cart = user.cart;
            let result = true;
            if (cart.length > 0) {
                for (let i = 0; i < cart.length; i++) {
                    if (cart[i]._id === product._id) {
                        cart[i] = product;
                        result = false;
                    }
                }
                if (result === true) {
                    cart.push(product);
                }
            } else {
                cart.push(product);
            }

            //tao user cart
            const newCart = userCart(req, res, user, cart);
            if (newCart !== null) {
                req.flash('msg', 'Thêm vào giỏ hàng thành công');
                res.redirect('back');
            }
        } catch (error) {
            throw new Error(error);
        }
    }
});

//goi trang gio hang
const getCart = asyncHandler(async (req, res) => {
    try {
        const user = await User.findOne({
            refreshToken: req.cookies.refreshToken,
        });
        let cart = await Cart.findOne({ orderBy: user._id }).populate('products.product', 'name slug imgUrl _id');

        if (cart == null) {
            req.flash('msg', 'Chưa có sản phẩm trong giỏ hàng !!!');
        }
        const brands = await Brand.find();
        // console.log("%j", cart);
        res.render('index/cart', {
            brands,
            user,
            cart,
            msg: req.flash('msg'),
            err: req.flash('err'),
        });
    } catch (error) {
        throw new Error(error);
    }
});

//xoa san pham khoi gio hang
const getDeleteCart = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const user = await User.findOne({
            refreshToken: req.cookies.refreshToken,
        });
        //cart tu gio hang
        let cart = await Cart.findOne({ orderBy: user._id });
        //cart tu user
        let cartUser = user.cart;
        //ktra xem co tim thay phan tu
        for (let i = 0; i < cart.products.length; i++) {
            if (cart.products[i]._id == id) {
                const filterCart = cartUser.filter((product) => product._id != cart.products[i].product.toString());
                if (filterCart.length == 0) {
                    await Cart.findOneAndDelete({ orderBy: user._id });
                    req.flash('msg', 'Xóa sản phẩm khỏi giỏ hàng thành công');
                    res.redirect('/gio-hang');
                } else {
                    const newCart = userCart(req, res, user, filterCart);
                    if (newCart !== null) {
                        req.flash('msg', 'Xóa sản phẩm khỏi giỏ hàng thành công');
                        res.redirect('/gio-hang');
                    } else {
                        req.flash('err', 'Có lỗi xảy ra');
                        res.redirect('/gio-hang');
                    }
                }
            }
        }
    } catch (error) {
        throw new Error(error);
    }
});

//cap nhat so luong san pham
const updateCount = asyncHandler(async (req, res) => {
    const id = req.body.id;
    validateMongoDBId(id);
    const count = req.body.count;
    try {
        const user = await User.findOne({
            refreshToken: req.cookies.refreshToken,
        });
        for (let i = 0; i < user.cart.length; i++) {
            if (user.cart[i]._id == id) {
                user.cart[i].count = parseInt(count);
            }
        }
        const newCart = userCart(req, res, user, user.cart);
        if (newCart !== null) {
            req.flash('msg', 'Thay đổi số lượng sản phẩm thành công');
            res.redirect('/gio-hang');
        } else {
            req.flash('err', 'Có lỗi xảy ra');
            res.redirect('/back');
        }
    } catch (error) {
        throw new Error(error);
    }
});

//them ma giam gia
const applyCoupon = asyncHandler(async (req, res) => {
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    const coupon = req.body.code;
    if (coupon == '') {
        req.flash('err', 'Chưa nhập mã giảm giá !');
        res.redirect('back');
        return;
    }
    const validCoupon = await Coupon.findOne({ code: coupon });
    if (validCoupon === null) {
        req.flash('err', 'Mã giảm giá không hợp lệ !');
        res.redirect('back');
        return;
    } else {
        let { cartTotal } = await Cart.findOne({
            orderBy: user._id,
        }).populate('products.product');
        let totalAfterDiscount = 0;
        if (user.userDiscount > 0) {
            totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount * user.userDiscount) / 100).toFixed(2);
        } else {
            totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2);
        }
        await Cart.findOneAndUpdate(
            { orderBy: user._id },
            {
                totalAfterDiscount: totalAfterDiscount,
                discount: validCoupon.discount,
            },
            {
                new: true,
            },
        );
        req.flash('msg', 'Đã áp dụng mã giảm giá');
        res.redirect('/gio-hang');
    }
});

//them vao yeu thich
const addToWishList = asyncHandler(async (req, res) => {
    try {
        const findUser = await User.findOne({
            refreshToken: req.cookies.refreshToken,
        });
        if (findUser == null) {
            req.flash('err', 'Bạn cần đăng nhập để thêm sản phẩm vào mục ưa thích');
            res.redirect('/dang-nhap');
            return;
        } else {
            const prodId = req.params.id;
            validateMongoDBId(prodId);
            const alreadyAdded = findUser.wishlist.find((id) => id.toString() === prodId);
            if (alreadyAdded) {
                let user = await User.findByIdAndUpdate(
                    findUser._id,
                    {
                        $pull: { wishlist: prodId },
                    },
                    {
                        new: true,
                    },
                );
                req.flash('msg', 'Thêm sản phẩm vào mục yêu thích thành công');
                res.redirect('back');
            } else {
                let user = await User.findByIdAndUpdate(
                    findUser._id,
                    {
                        $push: { wishlist: prodId },
                    },
                    {
                        new: true,
                    },
                );
                req.flash('msg', 'Thêm sản phẩm vào mục yêu thích thành công');
                res.redirect('back');
            }
        }
    } catch (err) {
        req.flash('err', 'Có lỗi xảy ra!');
        res.redirect('back');
        throw new Error(err);
    }
});

//lay yeu thich
const getWishList = asyncHandler(async (req, res) => {
    const findUser = await User.findOne({
        refreshToken: req.cookies.refreshToken,
    });
    if (!findUser) throw new Error('Token bi loi hoac khong dung');
    try {
        const user = await findUser.populate('wishlist');
        if (user.wishlist.length == 0) {
            req.flash('msg', 'Chưa có sản phẩm trong mục yêu thích !!!');
        }
        //console.log("%j", user);
        res.render('index/wishlist', {
            user,
            msg: req.flash('msg'),
            err: req.flash('err'),
        });
    } catch (err) {
        throw new Error(err);
    }
});

//xoa san pham khoi muc yeu thich
const getDeleteWishlist = asyncHandler(async (req, res) => {
    const prodId = req.params.id;
    validateMongoDBId(prodId);
    try {
        const findUser = await User.findOne({
            refreshToken: req.cookies.refreshToken,
        });
        const result = findUser.wishlist.find((id) => id.toString() === prodId);
        if (result != null) {
            let user = await User.findByIdAndUpdate(
                findUser._id,
                {
                    $pull: { wishlist: prodId },
                },
                {
                    new: true,
                },
            );
            req.flash('msg', 'Xóa thành công sản phẩm khỏi mục ưa thích');
            res.redirect('back');
        } else {
            req.flash('err', 'Có lỗi xảy ra !');
            res.redirect('back');
        }
    } catch (error) {
        throw new Error(error);
    }
});

//tao hoa don
const createOrder = asyncHandler(async (req, res) => {
    const { address, payment_method, name, mobile } = req.body;

    if (!payment_method) {
        req.flash('err', 'Chưa lựa chọn phương thức thanh toán !!!');
        res.redirect('back');
        return;
    }

    try {
        if (payment_method === 'COD') {
            const user = await User.findOne({
                refreshToken: req.cookies.refreshToken,
            });

            const shippingAddress = address ? address : user.address;
            const userName = name ? name : user.name;
            const userMobile = mobile ? mobile : user.mobile;

            let userCart = await Cart.findOne({ orderBy: user._id });
            let finalAmout = 0;
            if (userCart.totalAfterDiscount) {
                finalAmout = userCart.totalAfterDiscount;
            } else {
                finalAmout = userCart.cartTotal;
            }

            let newOrder = await new Order({
                products: userCart.products,
                paymentIntent: {
                    id: uniqid(),
                    method: 'COD',
                    amount: finalAmout,
                    status: 'Cash on Delivery',
                    created: Date.now(),
                    currency: 'vnd',
                },
                priceTotal: userCart.cartTotal,
                priceAfterDiscount: userCart.totalAfterDiscount,
                discount: userCart.discount,
                userDiscount: userCart.userDiscount,
                priceAfterUserDiscount: userCart.totalAfterUserDiscount,
                orderBy: user._id,
                orderStatus: 'Cash on Delivery',
                shippingStatus: 'Chưa giao hàng',
                shippingAddress: shippingAddress,
                userName: userName,
                userMobile: userMobile,
            }).save();

            let update = userCart.products.map((item) => {
                return {
                    updateOne: {
                        filter: { _id: item.product._id },
                        update: { $inc: { quantity: -item.count, sold: +item.count } },
                    },
                };
            });

            const updated = await Product.bulkWrite(update, {});
            await Cart.findOneAndRemove({ orderBy: user._id });
            await User.findByIdAndUpdate(user._id, { cart: [] });
            req.flash('msg', 'Tạo đơn hàng thành công !');
            res.redirect('/');
        } else {
            req.flash('err', 'Trang web chưa chấp nhận thanh toán Online !');
            res.redirect('back');
        }
    } catch (error) {
        throw new Error(error);
    }
});

const getBlog = asyncHandler(async (req, res) => {
    try {
        //Loc chuoi query
        const queryStr = fillterQuery(req, res);

        //Lay danh sach san pham
        let query = Blog.find(JSON.parse(queryStr));

        //Tien hanh sap xep va phan trang
        //Sap xep
        query = sortQuery(req, res, query);

        //Truong duoc chon
        query = limitQuery(req, res, query);

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const skip = (page - 1) * limit; //(page * limit) - limt

        const numBlog = await Blog.countDocuments(); //tong so san pham

        query = query.skip(skip).limit(limit);

        const blogs = await query;

        const pages = Math.ceil(numBlog / limit); //tong so trang
        res.render('index/blog', {
            category: req.query.category,
            blogs,
            current: page,
            pages,
            err: req.flash('err'),
            msg: req.flash('msg'),
        });
    } catch (err) {
        req.flash('err', 'Có lỗi xảy ra !');
        res.redirect('back');
        throw new Error(err);
    }
});

const getSingleBlog = asyncHandler(async (req, res) => {
    try {
        const { slug } = req.params;
        const blog = await Blog.findOne({
            slug: slug,
        });
        const numsView = parseInt(blog.numViews) + 1;
        await Blog.findOneAndUpdate({ slug: slug }, { numViews: numsView });
        res.render('index/singleBlog', {
            blog,
            err: req.flash('err'),
            msg: req.flash('msg'),
        });
    } catch (err) {
        req.flash('err', 'Có lỗi xảy ra !');
        res.redirect('back');
        throw new Error(err);
    }
});

export {
    createUser,
    getSingleBlog,
    getBlog,
    rating,
    createOrder,
    updateCount,
    getUpdateUser,
    addToWishList,
    getWishList,
    getDeleteWishlist,
    getSearch,
    applyCoupon,
    addToCart,
    getCart,
    getChangePassword,
    getHomePage,
    getLoginPage,
    getRegisterPage,
    getDetailProduct,
    getDeleteCart,
    changeProfile,
};
