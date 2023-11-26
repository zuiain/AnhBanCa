import express from 'express';

import { supplierController } from '~/controller';

const router = express.Router();

router.get('/', supplierController.getList);

router.get('/search', supplierController.getSearch);

router.get('/:slug', supplierController.getDetail);

router.post('/create', supplierController.createPost);

router.put('/update/:id', supplierController.updatePut);

router.delete('/delete/:id', supplierController.delDelete);

export default router;
