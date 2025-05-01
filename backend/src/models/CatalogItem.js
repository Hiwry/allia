import mongoose from 'mongoose';

const CatalogItemSchema = new mongoose.Schema({
  grupo: { type: String, required: true }, // Ex: gola, detalhe, tecido, corte, personalizacao, cor
  nome: { type: String, required: true },
  personalizacoes: { type: [String], default: [] }, // Ex: ['Serigrafia', 'DTF']
  valor: { type: Number, default: 0 },
  tecidos: { type: [String], default: [] }, // Ex: ['Algodão', 'Poliéster'] para tipos de malha
  ordem: { type: Number, default: 0 },
  imagem: { type: String }, // url do arquivo
  ativo: { type: Boolean, default: true },
  rgb: { type: String, default: '#ffffff' }, // Cor em formato hexadecimal
  tipoMalha: { type: [String], default: [] }, // Tipos de tecido associados à cor
  corClara: { type: Boolean, default: false }, // Indica se é cor clara (para filtro Sublimação Local)
});

export default mongoose.model('CatalogItem', CatalogItemSchema);
