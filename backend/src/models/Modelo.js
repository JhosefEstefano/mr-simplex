import mongoose, { Schema } from 'mongoose';
import { ESTADOS } from '../constants/dominio.js';

const RestriccionSchema = new Schema(
  {
    coeficientes: { type: [Number], required: true },
    signo: { type: String, enum: ['<=', '>=', '='], required: true },
    rhs: { type: Number, required: true }
  },
  { _id: false }
);

/**
 * Un modelo de programación lineal con su resolución embebida.
 * La resolución guarda tal cual la respuesta del solver, para que el
 * frontend pueda volver a mostrar los cuatro pasos sin recalcular.
 */
const ModeloSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 100 },
    objetivo: { type: String, enum: ['MAX', 'MIN'], required: true },
    numVariables: { type: Number, min: 2, max: 6, required: true },
    coeficientesZ: { type: [Number], required: true },
    restricciones: {
      type: [RestriccionSchema],
      validate: {
        validator: (lista) => Array.isArray(lista) && lista.length > 0,
        message: 'El modelo debe tener al menos una restricción.'
      }
    },
    resolucion: {
      estado: { type: String, enum: [ESTADOS.OPTIMO, ESTADOS.INFACTIBLE, ESTADOS.NO_ACOTADO] },
      mensaje: String,
      modelo: Schema.Types.Mixed,
      formaEstandar: Schema.Types.Mixed,
      tablaInicial: Schema.Types.Mixed,
      iteraciones: [Schema.Types.Mixed],
      tableauFinal: Schema.Types.Mixed,
      resultado: Schema.Types.Mixed,
      resueltoEn: Date
    }
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } }
);

export const Modelo = mongoose.models.Modelo ?? mongoose.model('Modelo', ModeloSchema);

export default Modelo;
