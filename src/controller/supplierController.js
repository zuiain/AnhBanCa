import asyncHandler from 'express-async-handler';
import slugify from 'slugify';

import { Supplier } from '~/models';
import { validateMongoDBId, pageQuery } from '~/utils/';
import { supplierValidate } from '~/validation/';

// Get the supplier list
const getList = asyncHandler(async (req, res) => {
    try {
        const queryStr = pageQuery.filterQuery(req, res);

        let _suppliers = Supplier.find(queryStr);

        _suppliers = pageQuery.sortQuery(req, _suppliers);

        _suppliers = pageQuery.limitQuery(req, _suppliers);

        const numBrands = await Supplier.countDocuments();

        const suppliers = await pageQuery.pagination(req, _suppliers, numBrands);

        if (suppliers) {
            res.json({ data: suppliers.data, pages: suppliers.pages });
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
        const supplier = await Supplier.findOne({ slug });
        if (supplier) {
            res.json(supplier);
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

        const newBrand = await Supplier.create(req.body);

        if (newBrand) {
            res.json(newBrand);
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

        const updateSupplier = await Supplier.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (updateSupplier) {
            res.json(updateSupplier);
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
        const deleteSupplier = await Supplier.findByIdAndDelete(id);
        if (deleteSupplier) {
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

        const numberDocs = await Supplier.countDocuments(querySearch);
        const _searchSupplier = Supplier.find(querySearch);
        const searchSupplier = await pageQuery.pagination(req, _searchSupplier, numberDocs);

        if (searchSupplier) {
            res.json({ data: searchSupplier.data, pages: searchSupplier.pages });
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
