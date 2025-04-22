import express from 'express';
import CatalogItem from '../models/CatalogItem.js';

const router = express.Router();

// Listar todos os itens de um grupo
router.get('/:grupo', async (req, res) => {
  try {
    const { grupo } = req.params;
    const items = await CatalogItem.find({ grupo }).sort({ ordem: 1, nome: 1 });
    res.json(items);
  } catch (err) {
    console.error('Erro ao buscar catálogo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Criar novo item
router.post('/:grupo', async (req, res) => {
  try {
    const { grupo } = req.params;
    const { nome, valor, imagem, ordem, personalizacoes, tecidos, rgb, tipoMalha, corClara } = req.body;
    const count = await CatalogItem.countDocuments({ grupo });
    const item = await CatalogItem.create({ grupo, nome, valor, imagem, ordem: ordem ?? count, personalizacoes, tecidos, rgb, tipoMalha, corClara });
    res.status(201).json(item);
  } catch (err) {
    console.error('Erro ao criar item do catálogo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Atualizar item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, valor, imagem, ordem, personalizacoes, tecidos, rgb, tipoMalha, corClara } = req.body;
    const item = await CatalogItem.findByIdAndUpdate(
      id,
      { nome, valor, imagem, ordem, personalizacoes, tecidos, rgb, tipoMalha, corClara },
      { new: true }
    );
    res.json(item);
  } catch (err) {
    console.error('Erro ao atualizar item do catálogo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Excluir item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await CatalogItem.findByIdAndDelete(id);
    res.sendStatus(204);
  } catch (err) {
    console.error('Erro ao excluir item do catálogo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reordenar itens de um grupo
router.post('/:grupo/reorder', async (req, res) => {
  try {
    const { grupo } = req.params;
    const { ordem } = req.body; // [{id, ordem}]
    for (const { id, ordem: newOrder } of ordem) {
      await CatalogItem.findByIdAndUpdate(id, { ordem: newOrder });
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Erro ao reordenar itens do catálogo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint temporário para adicionar item de costura de teste
router.post('/add-costura-teste', async (req, res) => {
  try {
    const CatalogItem = (await import('../models/CatalogItem.js')).default;
    const item = await CatalogItem.create({
      grupo: 'gola',
      nome: 'Gola Polo (Teste)',
      valor: 5.99,
      ativo: true
    });
    res.status(201).json({ ok: true, item });
  } catch (err) {
    console.error('Erro ao criar item de costura teste:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
