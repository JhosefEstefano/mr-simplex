import { Router } from 'express';
import { resolverController } from '../controllers/resolver.controller.js';

const router = Router();

router.post('/', resolverController);

export default router;
