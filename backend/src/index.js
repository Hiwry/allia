import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
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
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// **NOVO**: Servir arquivos estáticos da pasta 'uploads'
// Isso permite que o frontend acesse /uploads/layouts/arquivo.png, etc.
const UPLOADS_PATH = path.resolve(__dirname, '../uploads'); // Vai para a raiz do backend e entra em uploads
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

app.get('/', (req, res) => {
  res.send('Allia backend API rodando');
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
