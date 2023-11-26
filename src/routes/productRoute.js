import express from 'express';
// import { isAdmin, authMiddleware, checkSuperAdmin } from '~/middlewares/authMiddleware';
// import { uploadPhoto, productImgResize } from '~/middlewares/uploadImg';

import { productController } from '~/controller';

const router = express.Router();

router.get('/', productController.getList);

router.get('/search', productController.getSearch);

router.get('/:slug', productController.getDetail);

router.post('/create', productController.createPost);

router.put('/update/:id', productController.updatePut);

router.delete('/delete/:id', productController.delDelete);

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
