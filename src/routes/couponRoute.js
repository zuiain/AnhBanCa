const express = require('express');
const router = express.Router();
const { isAdmin, authMiddleware, checkSuperAdmin } = require('../middlewares/authMiddleware');
const {
    getCreateCoupon,
    createCoupon,
    getUpdateCoupon,
    updateCoupon,
    deleteCoupon,
    getAllCoupon,
    searchCoupon,
} = require('../controller/couponController');

router.get('/create', authMiddleware, isAdmin, checkSuperAdmin, getCreateCoupon);

router.post('/create', authMiddleware, isAdmin, createCoupon);

router.get('/update/:id', authMiddleware, isAdmin, checkSuperAdmin, getUpdateCoupon);

router.post('/update', authMiddleware, isAdmin, updateCoupon);

router.get('/delete/:id', authMiddleware, isAdmin, deleteCoupon);

router.get('/', authMiddleware, isAdmin, checkSuperAdmin, getAllCoupon);

router.get('/search', authMiddleware, checkSuperAdmin, isAdmin, searchCoupon);

module.exports = router;
