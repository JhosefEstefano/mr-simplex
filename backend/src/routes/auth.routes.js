import { Router } from 'express';
import {
  registrarController,
  iniciarSesionController,
  olvidarPasswordController,
  restablecerPasswordController,
  perfilController
} from '../controllers/auth.controller.js';
import { requiereAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

router.post('/register', asyncHandler(registrarController));
router.post('/login', asyncHandler(iniciarSesionController));
router.post('/forgot-password', asyncHandler(olvidarPasswordController));
router.post('/reset-password', asyncHandler(restablecerPasswordController));
router.get('/yo', requiereAuth, asyncHandler(perfilController));

export default router;
