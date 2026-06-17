import dotenv from 'dotenv';
import pg from 'pg';

// Carrega as variáveis do arquivo .env
dotenv.config();

// No PostgreSQL usamos o "Pool" da biblioteca 'pg'
const { Pool } = pg;

// Cria o pool de conexões utilizando a URL completa (DATABASE_URL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    
    // Configuração de SSL obrigatória para produção na Render
    // Se estiver rodando localmente (sem 'render.com' na URL), ele desativa o SSL automaticamente
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com') 
        ? { rejectUnauthorized: false } 
        : false
});

export default pool;