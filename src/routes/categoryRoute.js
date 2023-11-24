import express from 'express';
import { categoryController } from '~/controller';

const router = express.Router();

router.get('/', categoryController.categoryList);

router.get('/search', categoryController.categorySearch);

router.get('/:slug', categoryController.categoryDetail);

router.post('/create', categoryController.categoryCreatePost);

router.put('/update/:id', categoryController.categoryUpdatePost);

router.delete('/delete/:id', categoryController.categoryDelete);

export default router;
