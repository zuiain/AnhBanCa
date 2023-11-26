import express from 'express';
import { categoryController } from '~/controller';

const router = express.Router();

router.get('/', categoryController.getList);

router.get('/search', categoryController.getSearch);

router.get('/:slug', categoryController.getDetail);

router.post('/create', categoryController.createPost);

router.put('/update/:id', categoryController.updatePut);

router.delete('/delete/:id', categoryController.delDelete);

export default router;
