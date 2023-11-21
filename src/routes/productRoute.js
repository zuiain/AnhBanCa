import express from 'express';
// import { isAdmin, authMiddleware, checkSuperAdmin } from '~/middlewares/authMiddleware';
// import { uploadPhoto, productImgResize } from '~/middlewares/uploadImg';
import {
    getAProduct,
    getAllProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProduct,
} from '~/controller/productController';

const router = express.Router();

router.get('/', getAllProduct);

router.get('/search', searchProduct);

router.get('/:slug', getAProduct);

router.post('/create', createProduct);

router.put('/update/:id', updateProduct);

router.delete('/delete/:id', deleteProduct);

// router.get('/create', authMiddleware, isAdmin, checkSuperAdmin, getCreateProduct);

// router.post('/create', authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, createProduct);

// router.get('/update-img/:id', authMiddleware, isAdmin, checkSuperAdmin, getUpdateImg);

// router.post('/update-img', authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, updateImg);

// router.get('/update/:id', authMiddleware, isAdmin, checkSuperAdmin, getUpdateProduct);

// router.post('/update', authMiddleware, isAdmin, updateProduct);

// router.get('/search', checkSuperAdmin, searchProduct);

// router.put('/rating', authMiddleware, rating);

// router.get('/delete/:id', authMiddleware, isAdmin, deleteProduct);

// router.get('/rating/:id', authMiddleware, isAdmin, checkSuperAdmin, getComment);

// router.get('/rating/delete/:id', authMiddleware, isAdmin, deleteComment);

export default router;
