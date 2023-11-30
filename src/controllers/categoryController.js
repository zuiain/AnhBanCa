import asyncHandler from 'express-async-handler';
import slugify from 'slugify';

import { Category } from '~/models';
import { validateMongoDBId } from '~/utils/';
import { pageQuery } from '~/utils/';
import { categoryValidate } from '~/validation/';

// Get the category list
const getList = asyncHandler(async (req, res) => {
    try {
        const queryString = pageQuery.filterQuery(req, res);

        let _query = Category.find(queryString);

        _query = pageQuery.sortQuery(req, _query);

        _query = pageQuery.limitQuery(req, _query);

        const numDocs = await Category.countDocuments();

        const query = await pageQuery.pagination(req, _query, numDocs);

        if (query) {
            res.json({ data: query.data, pages: query.pages });
        } else {
            throw new Error('Error while finding category list');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Get detail category
const getDetail = asyncHandler(async (req, res) => {
    try {
        const { slug } = req.params;
        const query = await Category.findOne({ slug });
        if (query) {
            res.json(query);
        } else {
            throw new Error('Category not found');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Create a new category
const createPost = asyncHandler(async (req, res) => {
    try {
        const resultValidate = categoryValidate(req.body);

        if (resultValidate.error) {
            throw new Error(resultValidate.error);
        }

        req.body.slug = slugify(req.body.name);

        const query = await Category.create(req.body);

        if (query) {
            res.json(query);
        } else {
            throw new Error('Error while creating a  new category');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Update category
const updatePut = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const resultValidate = categoryValidate(req.body);

        if (resultValidate.error) {
            throw new Error(resultValidate.error);
        }

        req.body.slug = slugify(req.body.name);

        const query = await Category.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (query) {
            res.json(query);
        } else {
            throw new Error('Cannot find ID category');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Delete category
const delDelete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const query = await Category.findByIdAndDelete(id);
        if (query) {
            res.sendStatus(200);
        } else {
            throw new Error('Cannot find ID category');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Search category
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

        const numberDocs = await Category.countDocuments(queryString);
        console.log(numberDocs);
        const _query = Category.find(queryString);
        const query = await pageQuery.pagination(req, _query, numberDocs);

        if (query) {
            res.json({ data: query.data, pages: query.pages });
        } else {
            throw new Error('Error while searching for category');
        }
    } catch (err) {
        throw new Error(err);
    }
});

export const categoryController = {
    getList,
    getDetail,
    getSearch,
    createPost,
    updatePut,
    delDelete,
};
