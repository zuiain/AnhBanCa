import asyncHandler from 'express-async-handler';
import slugify from 'slugify';

import { Brand } from '~/models';
import { validateMongoDBId } from '~/utils/';
import { pageQuery } from '~/utils/';
import { brandValidate } from '~/validation/';

// Get the brand list
const getList = asyncHandler(async (req, res) => {
    try {
        const queryString = pageQuery.filterQuery(req, res);

        let _query = Brand.find(queryString);

        _query = pageQuery.sortQuery(req, _query);

        _query = pageQuery.limitQuery(req, _query);

        const numDocs = await Brand.countDocuments();

        const query = await pageQuery.pagination(req, _query, numDocs);

        if (query) {
            res.json({ data: query.data, pages: query.pages });
        } else {
            throw new Error('Error while getting brand list');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Get brand detail
const getDetail = asyncHandler(async (req, res) => {
    try {
        const { slug } = req.params;
        const query = await Brand.findOne({ slug });
        if (query) {
            res.json(query);
        } else {
            throw new Error('Brand not found');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Create a new brand
const createPost = asyncHandler(async (req, res) => {
    try {
        const resultValidate = brandValidate(req.body);

        if (resultValidate.error) {
            throw new Error(resultValidate.error);
        }

        req.body.slug = slugify(req.body.name);

        const query = await Brand.create(req.body);

        if (query) {
            res.json(query);
        } else {
            throw new Error('Error while creating a new brand');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Update brand
const updatePut = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const resultValidate = brandValidate(req.body);

        if (resultValidate.error) {
            throw new Error(resultValidate.error);
        }

        req.body.slug = slugify(req.body.name);

        const query = await Brand.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (query) {
            res.json(query);
        } else {
            throw new Error('Cannot find ID brand');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Delete brand
const delDelete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const query = await Brand.findByIdAndDelete(id);
        if (query) {
            res.sendStatus(200);
        } else {
            throw new Error('Cannot find ID brand');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Search brand
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

        const numberDocs = await Brand.countDocuments(queryString);
        const _query = Brand.find(queryString);
        const query = await pageQuery.pagination(req, _query, numberDocs);

        if (query) {
            res.json({ data: query.data, pages: query.pages });
        } else {
            throw new Error('Error while searching for brand');
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
