import { validarModelo, respuestaDeValidacion } from '../services/validarModelo.js';
import { resolver } from '../services/simplex.js';
import { Modelo } from '../models/Modelo.js';
import mongoose from 'mongoose';

/** Indica si el identificador tiene forma de ObjectId válido. */
function esIdValido(id) {
  return mongoose.isValidObjectId(id);
}

/** Separa los datos del modelo de la resolución que se guarda embebida. */
function datosDelModelo(cuerpo) {
  return {
    nombre: cuerpo.nombre,
    objetivo: cuerpo.objetivo,
    numVariables: cuerpo.numVariables,
    coeficientesZ: cuerpo.coeficientesZ,
    restricciones: cuerpo.restricciones
  };
}

/** Ejecuta el solver y prepara el bloque de resolución que se guarda. */
function prepararResolucion(modelo) {
  const respuesta = resolver(modelo);

  return {
    estado: respuesta.estado,
    mensaje: respuesta.mensaje,
    modelo: respuesta.modelo,
    formaEstandar: respuesta.formaEstandar,
    tablaInicial: respuesta.tablaInicial,
    iteraciones: respuesta.iteraciones,
    tableauFinal: respuesta.tableauFinal,
    resultado: respuesta.resultado,
    resueltoEn: new Date()
  };
}

/** Un modelo pertenece al usuario si su usuarioId coincide con el de la sesión. */
function esDelUsuario(modelo, usuarioId) {
  return modelo.usuarioId !== null && modelo.usuarioId.toString() === usuarioId.toString();
}

/**
 * POST /api/modelos
 * Guarda un modelo con su resolución embebida.
 */
export async function crearModeloController(req, res) {
  const { valido, errores } = validarModelo(req.body);

  if (!valido) {
    res.status(400).json(respuestaDeValidacion(errores));
    return;
  }

  const datos = datosDelModelo(req.body);
  const resolucion = prepararResolucion(datos);

  try {
    const guardado = await Modelo.create({
      ...datos,
      usuarioId: req.usuario.id,
      resolucion
    });
    res.status(201).json(guardado.toObject());
  } catch (error) {
    res.status(400).json({
      estado: 'ERROR_VALIDACION',
      mensaje: 'No se pudo guardar el modelo.',
      errores: [{ campo: 'modelo', mensaje: error.message }]
    });
  }
}

/**
 * GET /api/modelos
 * Lista los modelos del usuario y los ejemplos públicos, sin las iteraciones
 * para que la lista no pese.
 */
export async function listarModelosController(req, res) {
  const modelos = await Modelo.find({
    $or: [{ usuarioId: req.usuario.id }, { usuarioId: null }]
  })
    .select('-resolucion.iteraciones')
    .sort({ creadoEn: -1 });

  res.status(200).json({ modelos, total: modelos.length });
}

/**
 * GET /api/modelos/:id
 * Devuelve el modelo con su resolución completa.
 */
export async function obtenerModeloController(req, res) {
  if (!esIdValido(req.params.id)) {
    res.status(404).json({
      estado: 'NO_ENCONTRADO',
      mensaje: `El modelo ${req.params.id} no existe.`
    });
    return;
  }

  const modelo = await Modelo.findById(req.params.id);

  if (!modelo) {
    res.status(404).json({
      estado: 'NO_ENCONTRADO',
      mensaje: `El modelo ${req.params.id} no existe.`
    });
    return;
  }

  if (!esDelUsuario(modelo, req.usuario.id) && modelo.usuarioId !== null) {
    res.status(403).json({
      estado: 'SIN_PERMISO',
      mensaje: 'Este modelo pertenece a otra cuenta.'
    });
    return;
  }

  res.status(200).json(modelo.toObject());
}

/**
 * PUT /api/modelos/:id
 * Actualiza el modelo y vuelve a resolverlo.
 */
export async function actualizarModeloController(req, res) {
  const { valido, errores } = validarModelo(req.body);

  if (!valido) {
    res.status(400).json(respuestaDeValidacion(errores));
    return;
  }

  if (!esIdValido(req.params.id)) {
    res.status(404).json({
      estado: 'NO_ENCONTRADO',
      mensaje: `El modelo ${req.params.id} no existe.`
    });
    return;
  }

  const modelo = await Modelo.findById(req.params.id);

  if (!modelo) {
    res.status(404).json({
      estado: 'NO_ENCONTRADO',
      mensaje: `El modelo ${req.params.id} no existe.`
    });
    return;
  }

  if (!esDelUsuario(modelo, req.usuario.id)) {
    res.status(403).json({
      estado: 'SIN_PERMISO',
      mensaje: 'Este modelo pertenece a otra cuenta.'
    });
    return;
  }

  const datos = datosDelModelo(req.body);

  modelo.set(datos);
  modelo.resolucion = prepararResolucion(datos);
  await modelo.save();

  res.status(200).json(modelo.toObject());
}

/**
 * DELETE /api/modelos/:id
 * Elimina el modelo guardado.
 */
export async function eliminarModeloController(req, res) {
  if (!esIdValido(req.params.id)) {
    res.status(404).json({
      estado: 'NO_ENCONTRADO',
      mensaje: `El modelo ${req.params.id} no existe.`
    });
    return;
  }

  const modelo = await Modelo.findById(req.params.id);

  if (!modelo) {
    res.status(404).json({
      estado: 'NO_ENCONTRADO',
      mensaje: `El modelo ${req.params.id} no existe.`
    });
    return;
  }

  if (!esDelUsuario(modelo, req.usuario.id)) {
    res.status(403).json({
      estado: 'SIN_PERMISO',
      mensaje: 'Este modelo pertenece a otra cuenta.'
    });
    return;
  }

  await modelo.deleteOne();

  res.status(200).json({
    estado: 'ELIMINADO',
    mensaje: `El modelo "${modelo.nombre}" fue eliminado.`
  });
}
