const express = require('express');
const router = express.Router();
const { isAdmin, authMiddleware, checkSuperAdmin } = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImg');
const {
    getCreateBlog,
    createBlog,
    getUpdateBlog,
    updateBlog,
    deleteBlog,
    getAllBlog,
    searchBLog,
    getUpdateImg,
    updateImg,
} = require('../controller/blogController');

router.get('/create', authMiddleware, isAdmin, checkSuperAdmin, getCreateBlog);

router.post('/create', authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, createBlog);

router.get('/update/:id', authMiddleware, isAdmin, checkSuperAdmin, getUpdateBlog);

router.post('/update', authMiddleware, isAdmin, updateBlog);

router.get('/delete/:id', authMiddleware, isAdmin, deleteBlog);

router.get('/search', authMiddleware, isAdmin, checkSuperAdmin, searchBLog);

router.get('/', authMiddleware, isAdmin, checkSuperAdmin, getAllBlog);

router.get('/update-img/:id', authMiddleware, isAdmin, checkSuperAdmin, getUpdateImg);

router.post('/update-img', authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, updateImg);

module.exports = router;
