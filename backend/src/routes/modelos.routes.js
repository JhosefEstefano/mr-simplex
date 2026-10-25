import { Router } from 'express';
import {
  crearModeloController,
  listarModelosController,
  obtenerModeloController,
  actualizarModeloController,
  eliminarModeloController
} from '../controllers/modelos.controller.js';
import { requiereAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

// Toda la persistencia exige una sesión iniciada.
router.use(requiereAuth);

router.get('/', asyncHandler(listarModelosController));
router.post('/', asyncHandler(crearModeloController));
router.get('/:id', asyncHandler(obtenerModeloController));
router.put('/:id', asyncHandler(actualizarModeloController));
router.delete('/:id', asyncHandler(eliminarModeloController));

export default router;
