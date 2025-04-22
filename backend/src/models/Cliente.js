import mongoose from 'mongoose';

const enderecoSchema = new mongoose.Schema({
  rua: String,
  numero: String,
  complemento: String,
  bairro: String,
  cidade: String,
  estado: String,
  cep: String
}, { _id: false });

const clienteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome do cliente é obrigatório'],
    trim: true
  },
  tipoPessoa: {
    type: String,
    enum: ['fisica', 'juridica'],
    required: [true, 'Tipo de pessoa é obrigatório (fisica ou juridica)']
  },
  cpfCnpj: {
    type: String,
    required: [true, 'CPF/CNPJ é obrigatório'],
    unique: true,
    trim: true,
    // Adicionar validação de formato aqui seria ideal
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    // Adicionar validação de formato de email
  },
  telefone: {
    type: String,
    required: [true, 'Telefone do cliente é obrigatório'],
    trim: true
  },
  instagram: {
    type: String,
    trim: true
  },
  endereco: enderecoSchema, // Schema embutido para endereço
  categoria: {
    type: String,
    trim: true
  },
  obs: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt
});

// Índice para busca por CPF/CNPJ
clienteSchema.index({ cpfCnpj: 1 });
// Índice de texto para busca por nome (opcional, mas útil)
clienteSchema.index({ nome: 'text' });

const Cliente = mongoose.model('Cliente', clienteSchema);

export default Cliente; 