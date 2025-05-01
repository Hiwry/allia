import mysql from 'mysql2';

// Cria e exporta a conexão para uso em outros arquivos
const connection = mysql.createConnection({
  host: '50.6.138.208',
  user: 'vestal30_adminallia',
  password: 'Hiwry#12345',
  database: 'vestal30_allia'
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err.message);
    return;
  }
  console.log('Conectado ao MySQL com sucesso!');
});

export default connection;