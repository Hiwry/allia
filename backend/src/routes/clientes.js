import express from 'express';
import Cliente from '../models/Cliente.js'; // Importar o modelo Cliente

const router = express.Router();

// Rota POST /api/clientes - Criar novo cliente
router.post('/', async (req, res) => {
  console.log("[Clientes API] POST / - Body:", req.body);
  try {
    // Validar dados recebidos aqui seria ideal
    const { nome, tipoPessoa, cpfCnpj, email, telefone, endereco, categoria, obs } = req.body;

    // Verificar se já existe pelo CPF/CNPJ antes de criar
    const existingClient = await Cliente.findOne({ cpfCnpj });
    if (existingClient) {
      console.log("[Clientes API] Tentativa de criar cliente duplicado:", cpfCnpj);
      // Retornar o cliente existente em vez de erro? Ou erro 409?
      return res.status(409).json({ message: 'Cliente com este CPF/CNPJ já existe.', cliente: existingClient }); 
    }

    const novoCliente = new Cliente({
      nome,
      tipoPessoa,
      cpfCnpj,
      email,
      telefone,
      endereco,
      categoria,
      obs
    });

    const clienteSalvo = await novoCliente.save();
    console.log("[Clientes API] Cliente criado:", clienteSalvo);
    res.status(201).json(clienteSalvo);

  } catch (err) {
    console.error("[Clientes API] Erro ao criar cliente:", err);
    if (err.name === 'ValidationError') {
      res.status(400).json({ message: "Erro de validação ao criar cliente", errors: err.errors });
    } else {
      res.status(500).json({ message: err.message || 'Erro interno ao criar cliente.' });
    }
  }
});

// Rota GET /api/clientes/search - Buscar clientes
router.get('/search', async (req, res) => {
  const query = req.query.q; // Termo de busca da query string ?q=...
  console.log(`[Clientes API] GET /search?q=${query}`);
  
  if (!query) {
    return res.status(400).json({ message: 'Termo de busca (q) é obrigatório.' });
  }

  try {
    // Busca por nome (case-insensitive) OU CPF/CNPJ exato
    const results = await Cliente.find({
      $or: [
        { nome: { $regex: query, $options: 'i' } }, // Busca por nome (parcial, case-insensitive)
        { cpfCnpj: query } // Busca por CPF/CNPJ exato
      ]
    })
    .limit(10) // Limitar resultados para performance
    .select('_id nome cpfCnpj telefone email'); // Selecionar campos úteis para exibição

    console.log(`[Clientes API] Resultados da busca para "${query}":`, results.length);
    res.json(results);

  } catch (err) {
    console.error("[Clientes API] Erro ao buscar clientes:", err);
    res.status(500).json({ message: err.message || 'Erro interno ao buscar clientes.' });
  }
});

export default router; 