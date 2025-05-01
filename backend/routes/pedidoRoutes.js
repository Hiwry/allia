const express = require('express');
const router = express.Router();

// --- IMPORTANTE: Ajuste o caminho para o seu modelo Mongoose ---
// Se você já tem um arquivo de rotas para pedidos, apenas adicione a nova rota PATCH a ele.
// Se este é um novo arquivo, importe o modelo necessário.
let Pedido;
try {
  // Tente importar o modelo. Ajuste '../models/Pedido' conforme necessário.
  Pedido = require('../models/Pedido');
} catch (err) {
  console.error("\n*** ERRO IMPORTANTE: Não foi possível encontrar o Model 'Pedido'. ***");
  console.error("Verifique se o caminho '../models/Pedido' está correto no arquivo routes/pedidoRoutes.js.");
  console.error("Se o seu modelo tiver um nome diferente (ex: Order), ajuste o require.\n");
  // Criar um mock para evitar que o servidor quebre imediatamente, mas funcionalidade não funcionará.
  Pedido = { findByIdAndUpdate: () => Promise.reject(new Error("Modelo Pedido não carregado")) };
}

// --- IMPORTANTE: Se você usa middleware de autenticação, importe e descomente abaixo ---
// const authMiddleware = require('../middleware/auth'); // Exemplo

// ==============================================================
// ROTA: PATCH /api/pedidos/:id
// ==============================================================
// Atualiza parcialmente um pedido (ex: etapa de produção).
router.patch('/:id', /* authMiddleware, */ async (req, res) => {
  const pedidoId = req.params.id;
  const updates = req.body; // Corpo da requisição (ex: { setorAtualProducao: 'corte' })

  console.log(`[BACKEND] Recebida requisição PATCH para /api/pedidos/${pedidoId}`);
  console.log(`[BACKEND] Corpo da requisição (updates):`, updates);

  // 1. Definir campos permitidos para esta rota específica
  const camposPermitidosParaAtualizacao = ['setorAtualProducao']; // Apenas 'setorAtualProducao' é permitida aqui
  const camposRecebidos = Object.keys(updates);

  // 2. Validar se apenas campos permitidos foram enviados
  const isValidOperation = camposRecebidos.every((campo) => camposPermitidosParaAtualizacao.includes(campo));

  if (!isValidOperation || camposRecebidos.length === 0) {
    console.warn(`[BACKEND] Tentativa de atualização inválida para pedido ${pedidoId}. Campos recebidos: ${camposRecebidos.join(', ')}`);
    return res.status(400).json({
      message: 'Operação de atualização inválida.',
      details: `Apenas os campos [${camposPermitidosParaAtualizacao.join(', ')}] podem ser atualizados por esta rota.`,
      receivedFields: camposRecebidos
    });
  }

  try {
    // 3. Tentar encontrar e atualizar o pedido no banco de dados
    const pedidoAtualizado = await Pedido.findByIdAndUpdate(
      pedidoId,
      updates, // Passa o objeto { setorAtualProducao: 'novaEtapa' } para o Mongoose
      {
        new: true,           // Retorna o documento *após* a atualização
        runValidators: true, // Garante que as validações do Schema sejam executadas
        context: 'query'     // Necessário para algumas validações em updates
      }
    ).lean(); // .lean() pode otimizar, retornando um objeto JS puro

    // 4. Verificar se o pedido foi encontrado
    if (!pedidoAtualizado) {
      console.warn(`[BACKEND] Pedido com ID ${pedidoId} não encontrado para atualização PATCH.`);
      return res.status(404).json({ message: `Pedido com ID ${pedidoId} não encontrado.` });
    }

    // 5. Logar sucesso e retornar o pedido atualizado
    console.log(`[BACKEND] Pedido ${pedidoId} atualizado com sucesso. Nova etapa de produção: ${pedidoAtualizado.setorAtualProducao}`);
    res.status(200).json(pedidoAtualizado); // Retorna o pedido completo atualizado

  } catch (error) {
    console.error(`[BACKEND] Erro ao processar PATCH /api/pedidos/${pedidoId}:`, error);

    // Tratamento de erros comuns do Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Erro de validação ao atualizar pedido.', errors: error.errors });
    }
    if (error.name === 'CastError' && error.path === '_id') {
      return res.status(400).json({ message: 'ID do pedido fornecido é inválido.' });
    }

    // Erro genérico do servidor
    res.status(500).json({ message: 'Erro interno do servidor ao tentar atualizar o pedido.' });
  }
});

// --- Se este for um NOVO arquivo de rotas, exporte o router ---
// Se você adicionou a rota a um arquivo existente, este export pode já existir.
module.exports = router;
