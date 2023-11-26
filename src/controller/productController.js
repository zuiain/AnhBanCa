import slugify from 'slugify';
import asyncHandler from 'express-async-handler';

import { Product, User } from '~/models/';
import { validateMongoDBId, cloudinaryUploadImg } from '~/utils/';
import { pageQuery } from '~/utils/';
import { productValidate } from '~/validation/';

// Get information about products
const getList = asyncHandler(async (req, res) => {
    try {
        const queryString = pageQuery.filterQuery(req, res);

        let _query = Product.find(queryString);

        _query = pageQuery.sortQuery(req, _query);

        _query = pageQuery.limitQuery(req, _query);

        const numberDocs = await Product.countDocuments();

        const query = await pageQuery.pagination(req, _query, numberDocs);

        if (query) {
            res.json({ data: query.data, pages: query.pages });
        } else {
            throw new Error('Error while getting products list');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Get information about a product
const getDetail = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    try {
        const query = await Product.findOne({ slug: slug });
        if (query) {
            res.json(query);
        } else {
            throw new Error('Product not found');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Search products
const getSearch = asyncHandler(async (req, res) => {
    try {
        const { category, brand, q } = req.query;
        let _query, _brand, query;

        if (category) {
            _query = { category: category };
        }
        if (brand) {
            _brand = { brand: brand };
        }

        if (q) {
            query = {
                ..._query,
                ..._brand,
                $or: [
                    { slug: { $regex: q, $options: 'i' } },
                    { name: { $regex: q, $options: 'i' } },
                    { codeProd: { $regex: q, $options: 'i' } },
                ],
            };
        } else if (!category && !brand) {
            throw new Error('Please select a category or a brand');
        } else {
            query = {
                ..._query,
                ..._brand,
            };
        }

        const numberDocs = await Product.countDocuments(query);
        const _searchProducts = Product.find(query);
        const searchProducts = await pageQuery.pagination(req, _searchProducts, numberDocs);

        if (searchProducts) {
            res.json({ data: searchProducts.data, pages: searchProducts.pages });
        } else {
            throw new Error('Error while searching for products');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Create a new product
const createPost = asyncHandler(async (req, res) => {
    try {
        const resultValidate = productValidate(req.body);

        if (resultValidate.error) {
            throw new Error(resultValidate.error);
        }

        // check imgae file
        // if (!req.file) {
        //     res.redirect('back');
        //     return;
        // } else {
        //     const result = await cloudinaryUploadImg(req.file.path);
        //     req.body.imgUrl = result.url;
        // }

        req.body.slug = slugify(req.body.name);

        const query = await Product.create(req.body);

        if (query) {
            res.json(query);
        } else {
            throw new Error('Error while creating a new product');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Update product
const updatePut = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);

    try {
        const resultValidate = productValidate(req.body);
        if (resultValidate.error) {
            throw new Error(resultValidate.error);
        }

        req.body.slug = slugify(req.body.name);

        const query = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if (query) {
            res.json(query);
        } else {
            throw new Error('Cannot find ID product');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Delete product
const delDelete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);

    try {
        const query = await Product.findByIdAndDelete(id);
        if (query) {
            res.sendStatus(200);
        } else {
            throw new Error('Cannot find ID product');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Change image
const productUpdateImg = asyncHandler(async (req, res) => {
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
const productRating = asyncHandler(async (req, res) => {
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
        let ratingSum = getAllRatings.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingSum / totalRating);
        let finalProduct = await Product.findByIdAndUpdate(prodId, { totalRating: actualRating }, { new: true });

        res.json(finalProduct);
    } catch (err) {
        throw new Error(err);
    }
});

// Get information about comments
const productCommentList = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const product = await Product.findById(id).populate('ratings.postedBy');
        if (product) {
            if (product.ratings.length > 0) {
                res.json(product);
            } else {
                res.redirect('back');
            }
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Delete comment
const productCommentDelete = asyncHandler(async (req, res) => {
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
        throw new Error(err);
    }
});

export default {
    getList,
    getDetail,
    getSearch,
    createPost,
    updatePut,
    delDelete,
    productRating,
    productCommentList,
    productCommentDelete,
    productUpdateImg,
};
