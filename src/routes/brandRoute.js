import express from 'express';
import { brandController } from '~/controllers';

const router = express.Router();

router.get('/', brandController.getList);

router.get('/search', brandController.getSearch);

router.get('/:slug', brandController.getDetail);

router.post('/create', brandController.createPost);

router.put('/update/:id', brandController.updatePut);

router.delete('/delete/:id', brandController.delDelete);

export const brandRoute = router;
