import asyncHandler from 'express-async-handler';
import slugify from 'slugify';

import { Coupon } from '~/models';
import { validateMongoDBId, pageQuery } from '~/utils/';
import { couponValidate } from '~/validation/';

// Get the coupon list
const getList = asyncHandler(async (req, res) => {
    try {
        const queryString = pageQuery.filterQuery(req, res);

        let _query = Coupon.find(queryString);

        _query = pageQuery.sortQuery(req, _query);

        _query = pageQuery.limitQuery(req, _query);

        const numDocs = await Coupon.countDocuments();

        const query = await pageQuery.pagination(req, _query, numDocs);

        if (query) {
            res.json({ data: query.data, pages: query.pages });
        } else {
            throw new Error('Error while getting coupon list');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Get coupon detail
const getDetail = asyncHandler(async (req, res) => {
    try {
        const { slug } = req.params;
        const query = await Coupon.findOne({ slug });
        if (query) {
            res.json(query);
        } else {
            throw new Error('Coupon not found');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Create a new coupon
const createPost = asyncHandler(async (req, res) => {
    try {
        const resultValidate = couponValidate(req.body);

        if (resultValidate.error) {
            throw new Error(resultValidate.error);
        }

        req.body.slug = slugify(req.body.name);

        const query = await Coupon.create(req.body);

        if (query) {
            res.json(query);
        } else {
            throw new Error('Error while creating a new coupon');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Update coupon
const updatePut = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const resultValidate = couponValidate(req.body);

        if (resultValidate.error) {
            throw new Error(resultValidate.error);
        }

        req.body.slug = slugify(req.body.name);

        const query = await Coupon.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (query) {
            res.json(query);
        } else {
            throw new Error('Cannot find ID coupon');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Delete coupon
const delDelete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const query = await Coupon.findByIdAndDelete(id);
        if (query) {
            res.sendStatus(200);
        } else {
            throw new Error('Cannot find ID coupon');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Search coupon
const getSearch = asyncHandler(async (req, res) => {
    const { q } = req.query;
    let queryString;
    try {
        if (q) {
            queryString = {
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { slug: { $regex: q, $options: 'i' } },
                    { note: { $regex: q, $options: 'i' } },
                ],
            };
        } else {
            queryString = {};
        }

        const numberDocs = await Coupon.countDocuments(queryString);
        const _query = Coupon.find(queryString);
        const query = await pageQuery.pagination(req, _query, numberDocs);

        if (query) {
            res.json({ data: query.data, pages: query.pages });
        } else {
            throw new Error('Error while searching for coupon');
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
};
