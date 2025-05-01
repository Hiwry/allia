import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  loja: { type: String, trim: true },
  role: {
    type: String,
    enum: ['admin', 'vendedor', 'producao'],
    default: 'vendedor',
    required: true
  },
  profileImage: { type: String },
  funcoesProducao: [{
    type: String,
    enum: ['manager', 'corte', 'costura', 'serigrafia', 'sublimacao', 'bordado', 'transfer', 'limpeza', 'concluido', 'entrega']
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
