import asyncHandler from 'express-async-handler';
import slugify from 'slugify';

import { Category } from '~/models';
import { validateMongoDBId } from '~/utils/';
import { pageQuery } from '~/utils/';
import { categoryValidate } from '~/validation/';

// Get the category list
const categoryList = asyncHandler(async (req, res) => {
    try {
        const queryStr = pageQuery.filterQuery(req, res);

        let _categories = Category.find(queryStr);

        _categories = pageQuery.sortQuery(req, _categories);

        _categories = pageQuery.limitQuery(req, _categories);

        const numCategories = await Category.countDocuments();

        const categories = await pageQuery.pagination(req, _categories, numCategories);

        if (categories) {
            res.json({ data: categories.data, pages: categories.pages });
        } else {
            throw new Error('Error while finding category list');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Get detail category
const categoryDetail = asyncHandler(async (req, res) => {
    try {
        const { slug } = req.params;
        const category = await Category.findOne({ slug });
        if (category) {
            res.json(category);
        } else {
            throw new Error('Category not found');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Create a new category
const categoryCreatePost = asyncHandler(async (req, res) => {
    try {
        const resultValidate = categoryValidate(req.body);

        if (resultValidate.error) {
            throw new Error(resultValidate.error);
        }

        req.body.slug = slugify(req.body.name);

        const newCategory = await Category.create(req.body);

        if (newCategory) {
            res.json(newCategory);
        } else {
            throw new Error('Error while creating a  new category');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Update category
const categoryUpdatePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const resultValidate = categoryValidate(req.body);

        if (resultValidate.error) {
            throw new Error(resultValidate.error);
        }

        req.body.slug = slugify(req.body.name);

        const updateCategory = await Category.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (updateCategory) {
            res.json(updateCategory);
        } else {
            throw new Error('Cannot find ID category');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Delete category
const categoryDelete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const deleteCategory = await Category.findByIdAndDelete(id);
        if (deleteCategory) {
            res.sendStatus(200);
        } else {
            throw new Error('Cannot find ID category');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// Search category
const categorySearch = asyncHandler(async (req, res) => {
    const { q } = req.query;
    let querySearch;
    try {
        if (q) {
            querySearch = {
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { slug: { $regex: q, $options: 'i' } },
                    { note: { $regex: q, $options: 'i' } },
                ],
            };
        } else {
            querySearch = {};
        }

        const numberDocs = await Category.countDocuments(querySearch);
        console.log(numberDocs);
        const _searchCategories = Category.find(querySearch);
        const searchCategories = await pageQuery.pagination(req, _searchCategories, numberDocs);

        if (searchCategories) {
            res.json({ data: searchCategories.data, pages: searchCategories.pages });
        } else {
            throw new Error('Error while searching for category');
        }
    } catch (err) {
        throw new Error(err);
    }
});

export default { categoryList, categoryDetail, categoryUpdatePost, categoryCreatePost, categoryDelete, categorySearch };
