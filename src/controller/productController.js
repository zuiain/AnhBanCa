import slugify from 'slugify';
import asyncHandler from 'express-async-handler';

import { Product, User, Category, Supplier, Brand } from '~/models/index.js';
import { validateMongoDBId, cloudinaryUploadImg } from '~/utils/index';
import { fillterQuery, sortQuery, limitQuery } from '~/utils/pageQuery.js';
import { productSchema } from '~/validation/productSchema';

//lay danh sach san pham
const getAllProduct = asyncHandler(async (req, res) => {
    try {
        //Loc chuoi query
        const queryStr = fillterQuery(req, res);

        //Lay danh sach san pham
        let query = Product.find(JSON.parse(queryStr));

        //Tien hanh sap xep va phan trang
        //Sap xep
        query = sortQuery(req, res, query);

        //Truong duoc chon
        query = limitQuery(req, res, query);

        //Phan Trang
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit; //(page * limit) - limt

        const numProduct = await Product.countDocuments();

        query = query.skip(skip).limit(limit);

        const products = await query;

        const pages = Math.ceil(numProduct / limit);

        const categories = await Category.aggregate([{ $sort: { name: 1 } }]);
        const brands = await Brand.aggregate([{ $sort: { name: 1 } }]);
        const suppliers = await Supplier.find();

        res.render('admin/product/list', {
            s_category: '',
            s_brand: '',
            key: '',
            products,
            brands,
            categories,
            suppliers,
            current: page,
            pages,
            msg: req.flash('msg'),
            err: req.flash('err'),
        });
    } catch (err) {
        throw new Error(err);
    }
});

//tim san pham
const searchProduct = asyncHandler(async (req, res) => {
    try {
        const { category, brand, key } = req.query;
        console.log(category);
        console.log(brand);
        let searchProduct;
        if (key != '') {
            if ((category != '') & (brand != '')) {
                searchProduct = await Product.find({
                    category: category,
                    brand: brand,
                    $or: [
                        { slug: { $regex: key, $options: 'i' } },
                        { name: { $regex: key, $options: 'i' } },
                        { codeProd: { $regex: key, $options: 'i' } },
                    ],
                });
            } else if ((category != '') & (brand == '')) {
                searchProduct = await Product.find({
                    category: category,
                    $or: [
                        { slug: { $regex: key, $options: 'i' } },
                        { name: { $regex: key, $options: 'i' } },
                        { codeProd: { $regex: key, $options: 'i' } },
                    ],
                });
            } else if ((category == '') & (brand != '')) {
                searchProduct = await Product.find({
                    brand: brand,
                    $or: [
                        { slug: { $regex: key, $options: 'i' } },
                        { name: { $regex: key, $options: 'i' } },
                        { codeProd: { $regex: key, $options: 'i' } },
                    ],
                });
            } else if (category == '' && brand == '') {
                searchProduct = await Product.find({
                    $or: [
                        { slug: { $regex: key, $options: 'i' } },
                        { name: { $regex: key, $options: 'i' } },
                        { codeProd: { $regex: key, $options: 'i' } },
                    ],
                });
            }
        } else {
            if ((category != '') & (brand != '')) {
                searchProduct = await Product.find({
                    category: category,
                    brand: brand,
                });
            } else if ((category != '') & (brand == '')) {
                searchProduct = await Product.find({
                    category: category,
                });
            } else if ((category == '') & (brand != '')) {
                searchProduct = await Product.find({
                    brand: brand,
                });
            } else if (category == '' && brand == '') {
                req.flash('err', 'Chưa chọn loại tìm kiếm hoặc chưa nhập giá trị vào thanh tìm kiếm!');
                res.redirect('/product');
                return;
            }
        }
        if (searchProduct) {
            if (searchProduct.length > 0) {
                req.flash('msg', 'Tìm thấy ' + searchProduct.length + ' sản phẩm phù hợp');
            } else {
                req.flash('err', 'Không tìm thấy sản phẩm phù hợp !');
            }
        }
        console.log(brand);
        const categories = await Category.aggregate([{ $sort: { name: 1 } }]);
        const brands = await Brand.aggregate([{ $sort: { name: 1 } }]);
        const suppliers = await Supplier.find();
        res.render('admin/product/list', {
            s_category: category,
            s_brand: brand,
            key,
            suppliers,
            brands,
            categories,
            products: searchProduct,
            pages: 0,
            msg: req.flash('msg'),
            err: req.flash('err'),
        });
    } catch (err) {
        throw new Error(err);
    }
});

//lay chi tiet 1 san pham
const getAProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    } catch (err) {
        req.flash('err', 'Có lỗi xảy ra!');
        res.redirect('back');
        throw new Error(err);
    }
});

//dieu huong sang form them san pham
const getCreateProduct = async (req, res) => {
    try {
        const category = await Category.aggregate([{ $sort: { name: 1 } }]);
        const supplier = await Supplier.aggregate([{ $sort: { name: 1 } }]);
        const brands = await Brand.aggregate([{ $sort: { name: 1 } }]);
        res.render('admin/product/create', {
            brands,
            category,
            supplier,
            msg: req.flash('msg'),
            err: req.flash('err'),
        });
    } catch (err) {
        req.flash('err', 'Có lỗi xảy ra!');
        res.redirect('back');
        throw new Error(err);
    }
};

//them san pham
const createProduct = asyncHandler(async (req, res) => {
    try {
        //ktra dinh dang
        const result = productSchema.validate(req.body);
        if (result.error) {
            console.log(result.error);
            req.flash('err', 'Thông tin vừa nhập không đúng định dạng !');
            res.redirect('back');
            return;
        }
        //ktra file anh
        if (!req.file) {
            req.flash('err', 'Chưa chọn file ảnh !');
            res.redirect('back');
            return;
        } else {
            const result = await cloudinaryUploadImg(req.file.path);
            req.body.imgUrl = result.url;
        }
        if (req.body.name) {
            req.body.slug = slugify(req.body.name);
        }
        const newProduct = await Product.create(req.body);
        req.flash('msg', 'Thêm sản phẩm thành công');
        res.redirect('/product/create');
    } catch (err) {
        req.flash('err', 'Có lỗi xảy ra!');
        res.redirect('back');
        throw new Error(err);
    }
});

//hien form sua san pham
const getUpdateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const findProduct = await Product.findById(id);
        const category = await Category.aggregate([{ $sort: { name: 1 } }]);
        const supplier = await Supplier.aggregate([{ $sort: { name: 1 } }]);
        const brands = await Brand.aggregate([{ $sort: { name: 1 } }]);
        res.render('admin/product/update', {
            brands,
            product: findProduct,
            category,
            supplier,
            msg: req.flash('msg'),
            err: req.flash('err'),
        });
    } catch (err) {
        req.flash('err', 'Có lỗi xảy ra!');
        res.redirect('back');
        throw new Error(err);
    }
});

//sua san pham
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.body;
    console.log(id);
    validateMongoDBId(id);
    try {
        const result = productSchema.validate(req.body);
        if (result.error) {
            console.log(result.error);
            req.flash('err', 'Thông tin vừa nhập không đúng định dạng !');
            res.redirect('back');
            return;
        }
        if (req.body.tenSP) {
            req.body.slug = slugify(req.body.tenSP);
        }
        const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        req.flash('msg', 'Sửa thành công sản phẩm !');
        res.redirect('/product');
    } catch (err) {
        throw new Error(err);
    }
});

//xoa sp
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const deleteProduct = await Product.findByIdAndDelete(id);
        req.flash('msg', 'Xóa sản phẩm thành công');
        res.redirect('/product');
    } catch (err) {
        req.flash('err', 'Có lỗi xảy ra!');
        res.redirect('back');
        throw new Error(err);
    }
});

//sua anh
const getUpdateImg = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    {
        try {
            const product = await Product.findById(id);
            res.render('admin/product/updateImg', {
                product,
                msg: req.flash('msg'),
                err: req.flash('err'),
            });
        } catch (err) {
            req.flash('err', 'Có lỗi xảy ra!');
            res.redirect('back');
            throw new Error(err);
        }
    }
});

//sua anh
const updateImg = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const slugProd = slugify(name);
    let imgUrl;
    try {
        if (!req.file) {
            req.flash('err', 'Chưa chọn file ảnh !');
            res.redirect('back');
            return;
        } else {
            const result = await cloudinaryUploadImg(req.file.path);
            imgUrl = result.url;
            console.log(imgUrl);
        }
        const product = await Product.findOneAndUpdate(
            { slug: slugProd },
            { imgUrl: imgUrl },
            {
                new: true,
            },
        );
        if (product !== null) {
            req.flash('msg', 'Sửa ảnh thành công ');
            res.redirect('/product');
        } else {
            req.flash('msg', 'Có lỗi xảy ra !');
            res.redirect('back');
        }
    } catch (err) {
        throw new Error(err);
    }
});

//danh gia
const rating = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    const refreshToken = cookie.refreshToken;
    const findUser = await User.findOne({ refreshToken: refreshToken });
    if (!findUser) throw new Error('Token bi loi hoac khong dung');
    const { star, prodId, comment } = req.body;
    try {
        const product = await Product.findById(prodId);
        let alreadyRated = product.ratings.find((userId) => userId.postedby.toString() === findUser._id.toString());
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
        const getAllRatings = await Product.findById(prodId);
        let totalRating = getAllRatings.ratings.length;
        let ratingsum = getAllRatings.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingsum / totalRating);
        console.log(actualRating);
        let finalProduct = await Product.findByIdAndUpdate(prodId, { totalRating: actualRating }, { new: true });
        res.json(finalProduct);
    } catch (err) {
        req.flash('err', 'Có lỗi xảy ra!');
        res.redirect('back');
        throw new Error(err);
    }
});

const getComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const product = await Product.findById(id).populate('ratings.postedby');
        // res.send(product);
        if (product) {
            if (product.ratings.length > 0) {
                res.render('admin/product/rating', {
                    pages: 0,
                    product,
                    msg: req.flash('msg'),
                    err: req.flash('err'),
                });
            } else {
                req.flash('msg', 'Sản phẩm chưa có bình luận hay đánh giá !');
                res.redirect('back');
            }
        }
    } catch (err) {
        req.flash('err', 'Có lỗi xảy ra!');
        res.redirect('back');
        throw new Error(err);
    }
});

const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const id_array = id.split('-');
    const prodId = id_array[0];
    const ratingId = id_array[1];
    validateMongoDBId(prodId);
    validateMongoDBId(ratingId);
    try {
        const product = await Product.findById(prodId);
        const findRating = product.ratings.find(({ id }) => id.toString() === ratingId);
        if (findRating != null) {
            let product = await Product.findByIdAndUpdate(
                prodId,
                {
                    $pull: { ratings: { _id: ratingId } },
                },
                {
                    new: true,
                },
            );
            console.log(product);
            req.flash('msg', 'Xóa bình luận thành công');
            res.redirect('back');
        }
    } catch (err) {
        req.flash('err', 'Có lỗi xảy ra!');
        res.redirect('back');
        throw new Error(err);
    }
});

const test = () => {
    console.log('OK nha e !!!');
};

export {
    test,
    getComment,
    deleteComment,
    getCreateProduct,
    createProduct,
    getAProduct,
    getAllProduct,
    getUpdateProduct,
    updateProduct,
    deleteProduct,
    searchProduct,
    getUpdateImg,
    updateImg,
    rating,
};
