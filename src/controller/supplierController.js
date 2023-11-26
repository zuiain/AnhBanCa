import asyncHandler from 'express-async-handler';
import slugify from 'slugify';

import { Supplier } from '~/models';
import { validateMongoDBId, pageQuery } from '~/utils/';
import { supplierValidate } from '~/validation/';

// Get the supplier list
const getList = asyncHandler(async (req, res) => {
    try {
        const queryString = pageQuery.filterQuery(req, res);

        let _query = Supplier.find(queryString);

        _query = pageQuery.sortQuery(req, _query);

        _query = pageQuery.limitQuery(req, _query);

        const numDocs = await Supplier.countDocuments();

        const query = await pageQuery.pagination(req, _query, numDocs);

        if (query) {
            res.json({ data: query.data, pages: query.pages });
        } else {
            throw new Error('Error while getting supplier list');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Get supplier detail
const getDetail = asyncHandler(async (req, res) => {
    try {
        const { slug } = req.params;
        const query = await Supplier.findOne({ slug });
        if (query) {
            res.json(query);
        } else {
            throw new Error('Supplier not found');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Create a new supplier
const createPost = asyncHandler(async (req, res) => {
    try {
        const resultValidate = supplierValidate(req.body);

        if (resultValidate.error) {
            throw new Error(resultValidate.error);
        }

        req.body.slug = slugify(req.body.name);

        const query = await Supplier.create(req.body);

        if (query) {
            res.json(query);
        } else {
            throw new Error('Error while creating a new supplier');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Update supplier
const updatePut = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const resultValidate = supplierValidate(req.body);

        if (resultValidate.error) {
            throw new Error(resultValidate.error);
        }

        req.body.slug = slugify(req.body.name);

        const query = await Supplier.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (query) {
            res.json(query);
        } else {
            throw new Error('Cannot find ID supplier');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Delete supplier
const delDelete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const query = await Supplier.findByIdAndDelete(id);
        if (query) {
            res.sendStatus(200);
        } else {
            throw new Error('Cannot find ID supplier');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Search supplier
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

        const numberDocs = await Supplier.countDocuments(queryString);
        const _query = Supplier.find(queryString);
        const query = await pageQuery.pagination(req, _query, numberDocs);

        if (query) {
            res.json({ data: query.data, pages: query.pages });
        } else {
            throw new Error('Error while searching for supplier');
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
