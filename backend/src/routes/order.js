import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// Criar novo pedido
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Buscar pedido por ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar todos os pedidos
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ criadoEm: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
