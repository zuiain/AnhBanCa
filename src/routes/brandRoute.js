import express from 'express';
import { brandController } from '~/controller';

const router = express.Router();

router.get('/', brandController.brandList);

router.get('/search', brandController.brandSearch);

router.get('/:slug', brandController.brandDetail);

router.post('/create', brandController.brandCreatePost);

router.put('/update/:id', brandController.brandUpdatePost);

router.delete('/delete/:id', brandController.brandDelete);

export default router;
