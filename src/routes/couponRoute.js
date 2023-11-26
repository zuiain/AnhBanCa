import express from 'express';
import { couponController } from '~/controller';

const router = express.Router();

router.get('/', couponController.getList);

router.get('/search', couponController.getSearch);

router.get('/:slug', couponController.getDetail);

router.post('/create', couponController.createPost);

router.put('/update/:id', couponController.updatePut);

router.delete('/delete/:id', couponController.delDelete);

export default router;
