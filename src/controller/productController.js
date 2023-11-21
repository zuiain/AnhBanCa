import slugify from 'slugify';
import asyncHandler from 'express-async-handler';

import { Product, User, Category, Supplier, Brand } from '~/models/';
import { validateMongoDBId, cloudinaryUploadImg } from '~/utils/';
import { fillterQuery, sortQuery, limitQuery, pageQuery } from '~/utils/pageQuery.js';
import { productValidate } from '~/validation/';

// Get information about products
const getAllProduct = asyncHandler(async (req, res) => {
    console.log('da chay');
    try {
        const queryStr = fillterQuery(req, res);

        let _products = Product.find({});

        _products = sortQuery(req, _products);

        _products = limitQuery(req, _products);

        const numProduct = await Product.countDocuments();

        const products = await pageQuery(req, _products, numProduct);

        res.json({ products, pages: _products.pages });
    } catch (err) {
        throw new Error(err);
    }
});

// Get information about a product
const getAProduct = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    try {
        const findProduct = await Product.findOne({ slug: slug });
        res.json(findProduct);
    } catch (err) {
        throw new Error(err);
    }
});

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
    try {
        const result = productValidate(req.body);
        if (result.error) {
            res.sendStatus(403);
            return;
        }

        // check imgae file
        // if (!req.file) {
        //     res.redirect('back');
        //     return;
        // } else {
        //     const result = await cloudinaryUploadImg(req.file.path);
        //     req.body.imgUrl = result.url;
        // }

        if (req.body.name) {
            req.body.slug = slugify(req.body.name);
        }

        const newProduct = await Product.create(req.body);

        res.json(newProduct);
    } catch (err) {
        res.redirect('back');
        throw new Error(err);
    }
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);

    try {
        const result = productValidate(req.body);
        if (result.error) {
            res.sendStatus(403);
            return;
        }

        if (req.body.name) {
            req.body.slug = slugify(req.body.name);
        }

        const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        res.json(updateProduct);
    } catch (err) {
        throw new Error(err);
    }
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);

    try {
        const deleteProduct = await Product.findByIdAndDelete(id);
        res.sendStatus(200);
    } catch (err) {
        throw new Error(err);
    }
});

// Change image
const updateImg = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const slugProd = slugify(name);
    let imgUrl;
    try {
        if (!req.file) {
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
            res.redirect('/product');
        } else {
            res.redirect('back');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// rating product --- Need to check again !!!
const rating = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    const refreshToken = cookie.refreshToken;
    const findUser = await User.findOne({ refreshToken: refreshToken });
    if (!findUser) throw new Error('Token bi loi hoac khong dung');

    const { star, prodId, comment } = req.body;

    try {
        const product = await Product.findById(prodId);
        let alreadyRated = product.ratings.find((rating) => rating.postedby == findUser._id);

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
        let finalProduct = await Product.findByIdAndUpdate(prodId, { totalRating: actualRating }, { new: true });

        res.json(finalProduct);
    } catch (err) {
        res.redirect('back');
        throw new Error(err);
    }
});

// Get information about comments
const getComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const product = await Product.findById(id).populate('ratings.postedby');
        // res.send(product);
        if (product) {
            if (product.ratings.length > 0) {
                res.json(product);
            } else {
                res.redirect('back');
            }
        }
    } catch (err) {
        res.redirect('back');
        throw new Error(err);
    }
});

// Delete comment
const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const _id = id.split('-');
    const prodId = _id[0];
    const ratingId = _id[1];
    validateMongoDBId(prodId);
    validateMongoDBId(ratingId);
    try {
        const product = await Product.findById(prodId);
        const findRating = product.ratings.find((rating) => rating.id.toString() === ratingId);
        if (findRating) {
            let product = await Product.findByIdAndUpdate(
                prodId,
                {
                    $pull: { ratings: { _id: ratingId } },
                },
                {
                    new: true,
                },
            );

            res.redirect('back');
        }
    } catch (err) {
        res.redirect('back');
        throw new Error(err);
    }
});

// Search products
const searchProduct = asyncHandler(async (req, res) => {
    try {
        const { category, brand, key } = req.query;
        let searchProduct, _category, _brand;

        if (category) {
            _category = { category: category };
        }
        if (brand) {
            _brand = { brand: brand };
        }

        if (key) {
            searchProduct = await Product.find({
                ..._category,
                ..._brand,
                $or: [
                    { slug: { $regex: key, $options: 'i' } },
                    { name: { $regex: key, $options: 'i' } },
                    { codeProd: { $regex: key, $options: 'i' } },
                ],
            });
        } else if (!category && !brand) {
            res.sendStatus(403);
            return;
        } else {
            searchProduct = await Product.find({
                ..._category,
                ..._brand,
            });
        }

        res.json(searchProduct);
    } catch (err) {
        throw new Error(err);
    }
});

export {
    getAllProduct,
    getAProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    rating,
    getComment,
    deleteComment,
    searchProduct,
    updateImg,
};
