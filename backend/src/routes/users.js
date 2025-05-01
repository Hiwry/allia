import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import authMiddleware from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Garantir que o diretório de uploads exista
const uploadDir = 'uploads/profiles/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Diretório criado: ${uploadDir}`);
}

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas.'));
    }
  } 
});

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

// Rota para atualizar o perfil do usuário
router.put('/profile', authMiddleware, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, currentPassword, newPassword } = req.body;
    
    // Buscar usuário no banco
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    
    // Verificar se a atualização inclui alteração de senha
    if (newPassword) {
      // Verificar se a senha atual está correta
      if (!currentPassword) {
        return res.status(400).json({ message: 'Senha atual é obrigatória para alterar a senha.' });
      }
      
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Senha atual incorreta.' });
      }
      
      // Hash da nova senha
      user.password = await bcrypt.hash(newPassword, 10);
    }
    
    // Atualizar nome se fornecido
    if (name) {
      user.name = name;
    }
    
    // Atualizar foto de perfil se enviada
    if (req.file) {
      user.profileImage = `/uploads/profiles/${req.file.filename}`;
    }
    
    // Salvar alterações
    await user.save();
    
    // Retornar dados atualizados (sem senha)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      loja: user.loja,
      profileImage: user.profileImage
    };
    
    res.json({ message: 'Perfil atualizado com sucesso.', user: userResponse });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ message: 'Erro ao atualizar perfil.' });
  }
});

export default router;
