import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Este script se conecta ao MySQL (sem especificar um banco) e cria o banco de dados se ele não existir.
async function inicializarBanco() {
  try {
    // Trava de segurança: Se o host for 'db' (padrão Docker), força para localhost
    const dbHost = process.env.DB_HOST === 'db' ? '127.0.0.1' : (process.env.DB_HOST || 'localhost');

    const connection = await mysql.createConnection({
      host: dbHost,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'comercio'}\`;`);
    console.log(`✅ Banco de dados '${process.env.DB_NAME || 'comercio'}' verificado/criado com sucesso!`);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Erro ao criar o banco de dados:', error.message);
  }
}

inicializarBanco();