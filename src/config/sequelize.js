import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env
dotenv.config();

// Verifica se o ambiente é de produção (Render) ou desenvolvimento (Local)
const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

// Se no Render você colou a URL completa (Internal Database URL) dentro da variável DB_HOST
if (isProduction && process.env.DB_HOST && process.env.DB_HOST.startsWith('postgres')) {
    // O Sequelize lê a URL, extrai usuário, senha, banco e porta automaticamente!
    sequelize = new Sequelize(process.env.DB_HOST, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else {
    // Modo local (MySQL) ou se você tiver preenchido os campos separados
    const dbHost = process.env.DB_HOST === 'db' ? '127.0.0.1' : (process.env.DB_HOST || 'localhost');
    
    sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
        host: dbHost,
        port: process.env.DB_PORT || (isProduction ? 5432 : 3306),
        dialect: isProduction ? 'postgres' : 'mysql',
        logging: isProduction ? false : console.log, 
        dialectOptions: isProduction ? {
            ssl: { require: true, rejectUnauthorized: false }
        } : {} 
    });
}

export default sequelize;