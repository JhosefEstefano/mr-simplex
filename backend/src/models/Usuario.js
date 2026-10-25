import mongoose, { Schema } from 'mongoose';

/**
 * Cuenta de usuario del sistema. La contraseña nunca se guarda en claro:
 * se almacena cifrada con bcrypt.
 */
const UsuarioSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: { type: String, required: true },
    tokenRecuperacion: { type: String, default: null },
    expiraTokenRecuperacion: { type: Date, default: null }
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } }
);

export const Usuario = mongoose.models.Usuario ?? mongoose.model('Usuario', UsuarioSchema);

export default Usuario;
