import express from 'express';
import { blogController } from '~/controllers/';

const router = express.Router();

router.get('/', blogController.getList);

router.get('/:slug', blogController.getDetail);

export const blogRoute = router;
