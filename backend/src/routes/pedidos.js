import express from 'express';
import crypto from 'crypto'; // Importa crypto para gerar o token
import multer from 'multer'; // Importar multer
import path from 'path';   // Importar path
import fs from 'fs';       // Importar fs para criar pasta
import Pedido from '../models/Pedido.js';
import Cliente from '../models/Cliente.js'; // Importar modelo Cliente
import User from '../models/User.js'; // **NOVO**: Importar modelo User
import mongoose from 'mongoose'; // Importar mongoose para validar ObjectId
// Potencialmente importar Cliente from '../models/Cliente.js' depois

const router = express.Router();

// **NOVO**: Configuração do Multer para upload do layout final
const UPLOADS_DIR = path.resolve('./uploads/layouts');

// Garante que o diretório de uploads exista
if (!fs.existsSync(UPLOADS_DIR)){
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    // Define um nome de arquivo único: layout-<timestamp>-<nomeoriginal>
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'layout-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Função para calcular data de entrega (mover para utils talvez)
function adicionarDiasUteis(data, dias) {
  let resultado = new Date(data);
  let adicionados = 0;
  while (adicionados < dias) {
    resultado.setDate(resultado.getDate() + 1);
    if (resultado.getDay() !== 0 && resultado.getDay() !== 6) {
      adicionados++;
    }
  }
  return resultado;
}

// Rota GET / - Listar Pedidos (com dados do cliente populados)
router.get('/', async (req, res) => {
  try {
    // Adicionar .populate('cliente')
    const pedidos = await Pedido.find().populate('cliente', 'nome cpfCnpj telefone email').sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota GET /:id - Buscar pedido por ID (com populate)
router.get('/:id', async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id).populate('cliente');
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota POST /api/pedidos - Criar Pedido
router.post('/', upload.single('capaPedido'), async (req, res) => {
  console.log("[BACKEND LOG] Recebido POST /api/pedidos");
  console.log("[BACKEND LOG] req.file:", req.file);
  console.log("[BACKEND LOG] req.body.pedidoData (string):", req.body.pedidoData);

  let pedidoData;
  try {
    if (req.body.pedidoData) {
      pedidoData = JSON.parse(req.body.pedidoData);
      console.log("[BACKEND LOG] pedidoData (parsed):", pedidoData);
      // Log específico para dados do item que estavam faltando
      if(pedidoData.itens && pedidoData.itens[0]) {
          console.log("[BACKEND LOG] Item[0] recebido - valorGola:", pedidoData.itens[0].valorGola);
          console.log("[BACKEND LOG] Item[0] recebido - valorDetalhe:", pedidoData.itens[0].valorDetalhe);
          console.log("[BACKEND LOG] Item[0] recebido - imagemDetalheUrl:", pedidoData.itens[0].imagemDetalheUrl);
      }
    } else {
      // Se não tiver pedidoData, talvez seja um envio simples sem FormData?
      // Ou um erro? Tratar conforme necessário.
      console.warn("[BACKEND LOG] req.body.pedidoData não encontrado. Usando req.body diretamente.");
      pedidoData = req.body;
    }
  } catch (e) {
    console.error("Erro ao parsear pedidoData:", e);
    return res.status(400).json({ message: 'Formato de dados inválido.' });
  }

  // Desestruturar campos do pedido
  const { cliente: clienteInput, clienteId, itens, pagamentos, aplicacoesPorItem, valorTotal } = pedidoData;
  
  let clienteFinalId = null;
  let vendedorInfo = { id: null, nome: null, loja: null }; // **NOVO**: Para dados do vendedor

  try {
    // **NOVO**: Obter informações do vendedor (usuário logado)
    if (req.user && req.user.id) {
      const vendedorUser = await User.findById(req.user.id).select('name loja'); // Busca nome e loja
      if (vendedorUser) {
        vendedorInfo.id = vendedorUser._id;
        vendedorInfo.nome = vendedorUser.name; // Usar 'name' do modelo User
        vendedorInfo.loja = vendedorUser.loja;
        console.log("[BACKEND LOG] Dados do vendedor obtidos:", vendedorInfo);
      } else {
        console.warn(`[BACKEND LOG] Usuário vendedor com ID ${req.user.id} não encontrado.`);
        // Decidir se deve bloquear ou permitir criar pedido sem vendedor associado
        // Por enquanto, permite, mas loga o aviso.
      }
    } else {
       console.warn("[BACKEND LOG] req.user.id não encontrado. Pedido será criado sem vendedor associado.");
       // Considerar retornar erro 401/403 se autenticação for obrigatória
    }

    // Lógica para determinar o ID do cliente
    if (clienteId && mongoose.Types.ObjectId.isValid(clienteId)) {
      // 1. Usar clienteId se fornecido e válido
      console.log(`[BACKEND LOG] Usando clienteId existente: ${clienteId}`);
      // Opcional: Verificar se cliente realmente existe
      const clienteExistente = await Cliente.findById(clienteId);
      if (!clienteExistente) {
          throw new Error(`Cliente com ID ${clienteId} não encontrado.`);
      }
      clienteFinalId = clienteId;
    } else if (clienteInput && typeof clienteInput === 'object') {
      // 2. Criar novo cliente se objeto cliente foi fornecido
      console.log("[BACKEND LOG] Tentando criar novo cliente com dados:", clienteInput);
      // Validação básica - garantir que campos obrigatórios do cliente estão presentes
      if (!clienteInput.nome || !clienteInput.tipoPessoa || !clienteInput.cpfCnpj || !clienteInput.telefone) {
        throw new Error('Dados incompletos para criar novo cliente.');
      }
      // Tenta criar, tratando duplicação de CPF/CNPJ
      try {
          const novoClienteDoc = new Cliente(clienteInput);
          const clienteSalvo = await novoClienteDoc.save();
          console.log("[BACKEND LOG] Novo cliente criado com ID:", clienteSalvo._id);
          clienteFinalId = clienteSalvo._id;
      } catch (createError) {
          // Se erro for código 11000 (duplicado), tenta buscar o existente
          if (createError.code === 11000 && clienteInput.cpfCnpj) { 
              console.warn(`[BACKEND LOG] CPF/CNPJ ${clienteInput.cpfCnpj} duplicado. Buscando cliente existente.`);
              const clienteExistente = await Cliente.findOne({ cpfCnpj: clienteInput.cpfCnpj });
              if (clienteExistente) {
                  clienteFinalId = clienteExistente._id;
                  console.log(`[BACKEND LOG] Encontrado cliente existente com ID: ${clienteFinalId}`);
              } else {
                  // Se não encontrou mesmo com erro de duplicado, algo estranho aconteceu
                  throw new Error(`Erro ao criar cliente: CPF/CNPJ ${clienteInput.cpfCnpj} duplicado, mas não encontrado.`);
              }
          } else {
              // Re-lança outros erros de criação
              throw createError;
          }
      }
    } else {
      // 3. Erro se nem clienteId nem objeto cliente foram fornecidos
      throw new Error('ID do cliente (clienteId) ou dados do novo cliente (cliente) são obrigatórios.');
    }

    // Se chegou aqui, temos um clienteFinalId válido (ou erro já foi lançado)
    if (!clienteFinalId) {
        throw new Error('Não foi possível determinar o cliente para o pedido.');
    }

    // Continuar com a criação do pedido usando clienteFinalId e vendedorInfo
    const confirmacaoClienteToken = crypto.randomBytes(32).toString('hex');
    let urlLayoutFinal = null;
    if (req.file) {
      urlLayoutFinal = `/uploads/layouts/${req.file.filename}`;
      console.log("[BACKEND LOG] URL Layout Final definida:", urlLayoutFinal);
    } else {
      console.log("[BACKEND LOG] Nenhuma imagem de layout recebida (req.file vazio).");
    }
    const dataAtual = new Date();
    const dataLimiteConfirmacao = new Date(dataAtual);
    dataLimiteConfirmacao.setDate(dataAtual.getDate() + 3);
    const dataEntregaCalculada = adicionarDiasUteis(dataAtual, 15);
    console.log("[BACKEND LOG] Data Entrega Calculada:", dataEntregaCalculada);

    const novoPedido = new Pedido({
      cliente: clienteFinalId,
      vendedor: vendedorInfo.id, // **NOVO**
      nomeVendedor: vendedorInfo.nome, // **NOVO**
      nomeLoja: vendedorInfo.loja, // **NOVO**
      itens,
      pagamentos,
      aplicacoesPorItem,
      valorTotal,
      dataEntrega: dataEntregaCalculada,
      status: 'pendente_confirmacao_cliente',
      confirmacaoClienteToken: confirmacaoClienteToken,
      confirmacaoClienteExpiraEm: dataLimiteConfirmacao,
      urlLayoutFinal: urlLayoutFinal,
      dataPedido: dataAtual,
      numeroNotaFiscal: '', // Inicializa vazio
      statusGeral: 'aberto', // Status inicial
    });

    // LOG EXTRA: Verificar acréscimos de cada item
    if (Array.isArray(itens)) {
      itens.forEach((item, idx) => {
        console.log(`[BACKEND LOG] Item[${idx}] acrescimos:`, item.acrescimos);
        console.log(`[BACKEND LOG] Item[${idx}] valorTotalAcrescimos:`, item.valorTotalAcrescimos);
      });
    }

    const pedidoSalvo = await novoPedido.save();
    console.log("Pedido salvo com vendedor:", pedidoSalvo);
    res.status(201).json({ pedido: pedidoSalvo, token: confirmacaoClienteToken });

  } catch (err) {
    console.error("Erro ao processar/salvar pedido:", err);
    if (err.name === 'ValidationError') {
      console.error("Detalhes da Validação:", JSON.stringify(err.errors, null, 2));
      return res.status(400).json({ message: "Erro de validação", errors: err.errors });
    }
    // Retornar outros erros (ex: cliente não encontrado, erro ao criar cliente, etc.)
    res.status(400).json({ message: err.message || "Erro desconhecido ao salvar pedido." });
  }
});

// Rota GET /confirmacao/:token (com populate)
router.get('/confirmacao/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ message: 'Token não fornecido.' });
    }
    // Adicionar .populate('cliente')
    const pedido = await Pedido.findOne({ confirmacaoClienteToken: token }).populate('cliente');

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido não encontrado ou token inválido.' });
    }
    res.json(pedido);
  } catch (err) {
    console.error("Erro ao buscar pedido por token:", err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota PUT /confirmacao/:token (já existente, sem necessidade de populate aqui)
router.put('/confirmacao/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ message: 'Token não fornecido.' });
    }

    const pedido = await Pedido.findOne({ confirmacaoClienteToken: token });

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido não encontrado ou token inválido.' });
    }

    // Verifica se o pedido já não foi confirmado/processado
    if (pedido.status !== 'pendente_confirmacao_cliente') {
      return res.status(400).json({ message: 'Este pedido já foi confirmado ou está em processamento.' });
    }

    // Verifica se a data limite foi ultrapassada
    if (pedido.dataLimiteConfirmacao && new Date() > pedido.dataLimiteConfirmacao) {
        // Opcional: Mudar status para algo como 'expirado' ou apenas impedir a confirmação
        // pedido.status = 'expirado';
        // await pedido.save();
        return res.status(400).json({ message: 'O prazo para confirmação deste pedido expirou.' });
    }

    // Atualiza o status e a data de confirmação
    pedido.status = 'conferido'; // Próximo status após confirmação do cliente
    pedido.dataConfirmacaoCliente = new Date();
    pedido.setorAtualProducao = 'Fila de Produção'; // **ATUALIZADO**: Muda o setor após confirmação
    // Opcional: Remover o token após a confirmação para segurança
    // pedido.confirmacaoClienteToken = undefined;

    const pedidoAtualizado = await pedido.save();

    console.log("Pedido confirmado pelo cliente:", pedidoAtualizado);
    res.json({ message: 'Pedido confirmado com sucesso!', pedido: pedidoAtualizado });

  } catch (err) {
    console.error("Erro ao confirmar pedido pelo cliente:", err);
    res.status(500).json({ message: 'Erro interno do servidor ao confirmar o pedido.' });
  }
});

// Rota DELETE /:id - Excluir pedido por ID
router.delete('/:id', async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndDelete(req.params.id);
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }
    res.json({ message: 'Pedido excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Outras rotas (GET por ID, PUT geral, DELETE) podem existir aqui...

export default router; 