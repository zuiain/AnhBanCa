import asyncHandler from 'express-async-handler';
import slugify from 'slugify';

import { Brand } from '~/models';
import { validateMongoDBId } from '~/utils/';
import { pageQuery } from '~/utils/';
import { brandValidate } from '~/validation/';

// Get the brand list
const getList = asyncHandler(async (req, res) => {
    try {
        const queryStr = pageQuery.filterQuery(req, res);

        let _brands = Brand.find(queryStr);

        _brands = pageQuery.sortQuery(req, _brands);

        _brands = pageQuery.limitQuery(req, _brands);

        const numBrands = await Brand.countDocuments();

        const brands = await pageQuery.pagination(req, _brands, numBrands);

        if (brands) {
            res.json({ data: brands.data, pages: brands.pages });
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
        const brand = await Brand.findOne({ slug });
        if (brand) {
            res.json(brand);
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

        const newBrand = await Brand.create(req.body);

        if (newBrand) {
            res.json(newBrand);
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

        const updateBrand = await Brand.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (updateBrand) {
            res.json(updateBrand);
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
        const deleteBrand = await Brand.findByIdAndDelete(id);
        if (deleteBrand) {
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

        const numberDocs = await Brand.countDocuments(querySearch);
        const _searchBrand = Brand.find(querySearch);
        const searchBrand = await pageQuery.pagination(req, _searchBrand, numberDocs);

        if (searchBrand) {
            res.json({ data: searchBrand.data, pages: searchBrand.pages });
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