// 1. Carrega as variáveis do arquivo .env
require('dotenv').config();

const mysql = require('mysql2/promise');

// 2. Cria o pool de conexões utilizando as variáveis de ambiente ou os padrões
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'comercio',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;