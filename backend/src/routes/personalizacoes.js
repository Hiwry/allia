import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho ABSOLUTO para garantir que sempre use o mesmo arquivo na pasta src
const DATA_PATH = path.join(__dirname, 'personalizacoes.json');

const router = express.Router();

// Função para ler dados do arquivo JSON
function readData() {
  if (!fs.existsSync(DATA_PATH)) {
    // Se o arquivo não existe, cria com estrutura padrão
    const initial = { serigrafia: { escudo: [], a4: [], a3: [], cor: [] } };
    fs.writeFileSync(DATA_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const content = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    // Se der erro, retorna estrutura padrão
    return { serigrafia: { escudo: [], a4: [], a3: [], cor: [] } };
  }
}

// Função para salvar dados no arquivo JSON
function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// GET personalizacoes
router.get('/', (req, res) => {
  try {
    const data = readData();
    console.log('BACKEND GET /api/personalizacoes:', JSON.stringify(data, null, 2));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST personalizacoes
router.post('/', (req, res) => {
  try {
    console.log('POST /api/personalizacoes BODY:', JSON.stringify(req.body, null, 2));
    const { serigrafia } = req.body;
    if (!serigrafia) {
      console.error('Payload ausente: serigrafia não enviado!');
      return res.status(400).json({ error: 'Corpo inválido: serigrafia ausente.' });
    }
    // Validação: pelo menos um array de faixas não pode estar vazio
    const faixasTotal = ['escudo','a4','a3','cor'].reduce((acc, tipo) => acc + (Array.isArray(serigrafia[tipo]) ? serigrafia[tipo].length : 0), 0);
    if (faixasTotal === 0) {
      console.error('Nenhuma faixa enviada no payload!');
      return res.status(400).json({ error: 'Nenhuma faixa enviada.' });
    }
    // Log detalhado dos valores e quantidades das faixas
    ['escudo', 'a4', 'a3', 'cor'].forEach(tipo => {
      if (Array.isArray(serigrafia[tipo])) {
        serigrafia[tipo].forEach((faixa, idx) => {
          console.log(`[SERIGRAFIA] ${tipo.toUpperCase()} - Faixa ${idx + 1}: Qtd. ${faixa.min} a ${faixa.max}, Valor R$ ${faixa.valor}`);
        });
        console.log(`[SERIGRAFIA] Total de faixas em ${tipo}: ${serigrafia[tipo].length}`);
      }
    });
    // Lê o arquivo atual
    const data = readData();
    // Atualiza apenas o campo serigrafia, preservando outros campos se houver
    data.serigrafia = serigrafia;
    writeData(data);
    console.log('Arquivo personalizacoes.json atualizado com:', JSON.stringify(data, null, 2));
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Erro ao salvar personalizacoes:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
