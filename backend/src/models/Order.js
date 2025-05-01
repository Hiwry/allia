import mongoose from 'mongoose';

const AplicacaoSchema = new mongoose.Schema({
  tamanho: String,
  local: String,
  imagemUrl: String,
  nomeArte: String,
  efeito: String,
  cores: [String],
  nomesCores: [String],
  valor: Number,
  adicionais: [String],
});

const ItemSchema = new mongoose.Schema({
  descricao: String,
  quantidade: Number,
  valorUnitCostura: Number,
  valorUnitPersonalizacao: Number,
  valorUnitTotal: Number,
  valorTotal: Number,
  acrescimos: mongoose.Schema.Types.Mixed,
});

const PagamentoSchema = new mongoose.Schema({
  metodo: String,
  valor: Number,
  status: String,
});

const OrderSchema = new mongoose.Schema({
  cliente: mongoose.Schema.Types.Mixed,
  itens: [ItemSchema],
  aplicacoesPorItem: mongoose.Schema.Types.Mixed, // { itemId: [AplicacaoSchema] }
  pagamentos: [PagamentoSchema],
  capaPedido: String, // url da imagem da capa/layout
  status: { type: String, default: 'pendente' },
  criadoEm: { type: Date, default: Date.now },
});

export default mongoose.model('Order', OrderSchema);
