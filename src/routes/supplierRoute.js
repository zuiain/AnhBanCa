const express = require('express');
const router = express();
const { isAdmin, authMiddleware, checkSuperAdmin } = require('../middlewares/authMiddleware');
const {
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getAllSupplier,
    searchSupplier,
    getCreateSupplier,
    getUpdateSupplier,
} = require('../controller/supplierController');

router.get('/create', authMiddleware, isAdmin, checkSuperAdmin, getCreateSupplier);

router.post('/create', authMiddleware, isAdmin, createSupplier);

router.get('/update/:id', authMiddleware, isAdmin, checkSuperAdmin, getUpdateSupplier);

router.post('/update', authMiddleware, isAdmin, updateSupplier);

router.get('/delete/:id', authMiddleware, isAdmin, deleteSupplier);

router.get('/', authMiddleware, isAdmin, checkSuperAdmin, getAllSupplier);

router.get('/search', authMiddleware, isAdmin, checkSuperAdmin, searchSupplier);

module.exports = router;
