import { Router } from 'express';
import {
  crearModeloController,
  listarModelosController,
  obtenerModeloController,
  actualizarModeloController,
  eliminarModeloController
} from '../controllers/modelos.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listarModelosController));
router.post('/', asyncHandler(crearModeloController));
router.get('/:id', asyncHandler(obtenerModeloController));
router.put('/:id', asyncHandler(actualizarModeloController));
router.delete('/:id', asyncHandler(eliminarModeloController));

export default router;
