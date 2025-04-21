import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Cadastro
router.post('/register', async (req, res) => {
  console.log('POST /register body:', req.body); // LOG
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Preencha todos os campos.' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Erro no /register:', err); // LOG
    res.status(500).json({ message: 'Erro ao cadastrar.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  // console.log('POST /login body:', req.body); // Manter este log inicial pode ser útil
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      // console.log('Login attempt missing email or password'); // Remover
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    // console.log(`Attempting to find user with email: ${email}`); // Remover
    const user = await User.findOne({ email });

    if (!user) {
      // console.log(`User not found for email: ${email}`); // Remover
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }

    // console.log(`User found: ${user.email}, ID: ${user._id}`); // Remover
    // console.log(`Comparing provided password: [${password}] with stored hash: [${user.password}]`); // Remover

    const valid = await bcrypt.compare(password, user.password);
    // console.log(`bcrypt.compare result for ${email}: ${valid}`); // Remover

    if (!valid) {
      // console.log(`Password mismatch for user: ${email}`); // Remover
      return res.status(400).json({ message: 'Senha incorreta.' });
    }

    // console.log(`Login successful for user: ${email}`); // Remover
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });

  } catch (err) {
    console.error('Erro no /login:', err); // Manter log de erro
    res.status(500).json({ message: 'Erro interno ao fazer login.' });
  }
});

export default router;