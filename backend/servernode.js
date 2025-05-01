import express from 'express';
import connection from './db.js';

const app = express();
app.use(express.json());

// Endpoint para listar todos os usuários
app.get('/usuarios', (req, res) => {
  connection.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Endpoint para inserir novo usuário
app.post('/usuarios', (req, res) => {
  const { nome, email } = req.body;
  connection.query(
    'INSERT INTO usuarios (nome, email) VALUES (?, ?)',
    [nome, email],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: result.insertId, nome, email });
    }
  );
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
