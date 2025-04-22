import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Listar todos os usuários
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Nunca envie a senha
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Criar novo usuário
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, password, loja, role, funcoesProducao } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      loja,
      role,
      funcoesProducao
    });
    await user.save();
    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Editar usuário
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, password, loja, role, funcoesProducao } = req.body;
    const updateData = { name, email, loja, role, funcoesProducao };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ message: 'Usuário atualizado com sucesso!' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Excluir usuário
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ message: 'Usuário excluído com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
