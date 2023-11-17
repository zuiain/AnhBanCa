const express = require('express');
const router = express.Router();
const { isAdmin, authMiddleware, checkSuperAdmin } = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImg');
const {
    createProduct,
    getAProduct,
    getAllProduct,
    getUpdateProduct,
    updateProduct,
    deleteProduct,
    searchProduct,
    addToWishList,
    rating,
    getCreateProduct,
    getUpdateImg,
    updateImg,
    getComment,
    deleteComment,
} = require('../controller/productController');

router.get('/create', authMiddleware, isAdmin, checkSuperAdmin, getCreateProduct);

router.post('/create', authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, createProduct);

router.get('/update-img/:id', authMiddleware, isAdmin, checkSuperAdmin, getUpdateImg);

router.post('/update-img', authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, updateImg);

router.get('/update/:id', authMiddleware, isAdmin, checkSuperAdmin, getUpdateProduct);

router.post('/update', authMiddleware, isAdmin, updateProduct);

router.get('/', authMiddleware, isAdmin, checkSuperAdmin, getAllProduct);

router.get('/search', checkSuperAdmin, searchProduct);

router.put('/rating', authMiddleware, rating);

router.get('/delete/:id', authMiddleware, isAdmin, deleteProduct);

router.get('/rating/:id', authMiddleware, isAdmin, checkSuperAdmin, getComment);

router.get('/rating/delete/:id', authMiddleware, isAdmin, deleteComment);

module.exports = router;
