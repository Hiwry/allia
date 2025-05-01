import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import pedidosRoutes from './routes/pedidos.js';
import uploadRoutes from './routes/upload.js';
import catalogRoutes from './routes/catalog.js';
import personalizacoesRoutes from './routes/personalizacoes.js';
import clienteRoutes from './routes/clientes.js';
import usersRoutes from './routes/users.js';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Para obter __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors({
  origin: '*', // Permite qualquer origem. Para produção, idealmente especifique o domínio do frontend
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Garantir que os diretórios de upload existam
const UPLOADS_PATH = path.resolve(__dirname, '../uploads');
const PROFILE_UPLOADS_PATH = path.resolve(UPLOADS_PATH, 'profiles');
const LAYOUTS_UPLOADS_PATH = path.resolve(UPLOADS_PATH, 'layouts');
const PRODUCAO_UPLOADS_PATH = path.resolve(UPLOADS_PATH, 'producao');

// Criar diretórios se não existirem
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    console.log(`Criando diretório: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

ensureDirectoryExists(UPLOADS_PATH);
ensureDirectoryExists(PROFILE_UPLOADS_PATH);
ensureDirectoryExists(LAYOUTS_UPLOADS_PATH);
ensureDirectoryExists(PRODUCAO_UPLOADS_PATH);

// Servir arquivos estáticos da pasta 'uploads'
console.log(`Servindo arquivos estáticos de: ${UPLOADS_PATH}`);
app.use('/uploads', express.static(UPLOADS_PATH));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/personalizacoes', personalizacoesRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/users', usersRoutes);

// Rota principal para exibir mensagem amigável na raiz
app.get('/', (req, res) => {
  res.send('API Allia rodando com sucesso! 🚀');
});

// Conexão MongoDB (apenas via connectDB)
// console.log('MONGODB_URI:', process.env.MONGODB_URI);
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/allia';
// mongoose.connect(MONGODB_URI)
//   .then(() => console.log('MongoDB conectado'))
//   .catch(err => console.error('Erro ao conectar MongoDB:', err));

app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
