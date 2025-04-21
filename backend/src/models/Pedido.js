import mongoose from 'mongoose';

// Exemplo de Schema para Itens (ajustar conforme necessário)
const itemSchema = new mongoose.Schema({
  personalizacao: String,
  malha: String,
  tipoMalha: String,
  cor: String,
  corRgb: String, // Se a cor RGB for salva
  corte: String,
  valorBase: Number,
  gola: Boolean,
  tipoGola: String,
  imagemGolaUrl: String, // URL da imagem da gola vinda do catálogo
  detalhe: Boolean,
  tipoDetalhe: String,
  imagemDetalheUrl: String, // Adicionado na correção anterior
  valorGola: Number, // Adicionado na correção anterior
  valorDetalhe: Number, // Adicionado na correção anterior
  tamanhos: mongoose.Schema.Types.Mixed, // Objeto como { pp: 1, p: 5, ... }
  valorUnitario: Number, // Valor base + gola + detalhe
  valorTotal: Number, // Valor final do item (unitário * qtd + acrescimos totais)
  quantidade: Number,
  acrescimos: mongoose.Schema.Types.Mixed, // Objeto como { GG: 2, EXG: 4 }
  valorTotalAcrescimos: Number
}, { _id: false }); // Itens não precisam de _id próprio geralmente

// Exemplo de Schema para Pagamentos
const pagamentoSchema = new mongoose.Schema({
  forma: { type: String, required: true },
  metodo: { type: String }, // Ex: Dinheiro, Cartão, Pix, Transf.
  valor: { type: Number, required: true },
  dataPagamento: { type: Date }, // Data adicionada aqui
  status: { type: String, default: 'pendente' } // pendente, pago, cancelado
}, { _id: false });

// Exemplo de Schema para Aplicações de Personalização POR ITEM
const aplicacaoSchema = new mongoose.Schema({
  nomeArte: String,
  tamanho: String, // P, M, G, Único, etc.
  local: String, // Frente, Costas, Manga Esq, Manga Dir
  cores: [String], // Array de códigos hexadecimais das cores
  nomesCores: [String], // Array opcional com nomes das cores
  tamanhoPadrao: Boolean, // Se usa tamanho padrão da arte
  valor: Number, // Valor unitário desta aplicação
  imagemUrl: String // URL da imagem da arte aplicada (upload)
}, { _id: false });

const pedidoSchema = new mongoose.Schema({
  // ADICIONAR: Referência ao modelo Cliente
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente', // Nome do modelo que definimos em Cliente.js
    required: [true, 'Cliente é obrigatório para o pedido']
  },
  vendedor: { // **NOVO**: Referência ao usuário que criou o pedido
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Tornar opcional inicialmente, caso o middleware auth não esteja pronto
  },
  nomeVendedor: { // **NOVO**: Nome do vendedor (cache)
    type: String,
  },
  nomeLoja: { // **NOVO**: Nome da loja do vendedor (cache)
    type: String,
  },
  itens: [itemSchema], // Usa o schema definido acima
  pagamentos: [pagamentoSchema], // Usa o schema definido acima
  aplicacoesPorItem: mongoose.Schema.Types.Mixed, // Mantém flexível por enquanto
  valorTotal: { // Valor final do pedido (soma de item.valorTotal)
    type: Number,
    required: true
  },
  // Status atualizado com fluxo de confirmação e produção
  status: {
    type: String,
    required: true,
    enum: [
      'pendente_confirmacao_cliente',
      'conferido',
      'em_producao',
      'finalizado',
      'entregue',
      'cancelado'
    ],
    default: 'pendente_confirmacao_cliente'
  },
  urlLayoutFinal: { // URL da imagem do layout final/capa
    type: String
  },
  confirmacaoClienteToken: { // Token para link de confirmação
    type: String,
    unique: true,
    sparse: true // Permite múltiplos nulos, mas tokens existentes devem ser únicos
  },
  dataConfirmacaoCliente: { // Data que o cliente confirmou
    type: Date
  },
  dataEntrega: {
    type: Date
  },
  setorAtualProducao: {
    type: String,
    default: 'Aguardando Confirmação Cliente'
  },
  dataLimiteConfirmacao: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

// Middleware ou lógica para buscar/criar cliente pode ser adicionada aqui depois

// Criar índice no token para busca rápida
pedidoSchema.index({ confirmacaoClienteToken: 1 });

const Pedido = mongoose.model('Pedido', pedidoSchema);

export default Pedido; 