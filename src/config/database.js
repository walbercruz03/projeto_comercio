import dotenv from 'dotenv';
import pg from 'pg';

// Carrega as variáveis do arquivo .env
dotenv.config();

<<<<<<< HEAD
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
=======
// Trava de segurança: Se o host for 'db' (padrão Docker), força para localhost
const dbHost = process.env.DB_HOST === 'db' ? '127.0.0.1' : process.env.DB_HOST;

// Cria o pool de conexões confiando estritamente no que está no .env
const pool = mysql.createPool({
    host: dbHost || '127.0.0.1', 
    port: process.env.DB_PORT,        
    user: process.env.DB_USER,         
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
>>>>>>> 3e1a7a4 (sequelize)
});

export default pool;