CREATE DATABASE IF NOT EXISTS comercio;
USE comercio;

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50),
  cpf VARCHAR(50),
  data_nascimento DATE,
  email VARCHAR(50),
  telefone VARCHAR(50),
  senha VARCHAR(50)
);

-- 2. Tabela de Produtos
CREATE TABLE IF NOT EXISTS produto (
  id_produto INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  descricao TEXT,
  preco DECIMAL(10,2),
  estoque INT,
  imagem VARCHAR(255) NULL
);

-- 3. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedido (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- 4. Tabela de Itens do Pedido (Relacionamento Muitos para Muitos)
CREATE TABLE IF NOT EXISTS pedido_item (
  id_item INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT,
  id_produto INT,
  quantidade INT,
  preco_unitario DECIMAL(10,2),
  FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),
  FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);


-- Garante que o Admin oficial do sistema seja criado no Docker
INSERT INTO usuario (nome, cpf, data_nascimento, email, telefone, senha) 
VALUES ('Administrador', '000.000.000-00', '2000-01-01', 'admin@gmail.com', '(00) 00000-0000', 'admin123')
ON DUPLICATE KEY UPDATE id_usuario=id_usuario;

INSERT INTO produto (nome, descricao, preco, estoque, imagem) VALUES 
('Teclado Mecânico', 'Teclado RGB com switch azul', 250.00, 15, NULL),
('Mouse Gamer', 'Mouse de 12000 DPI com botões laterais', 150.00, 20, NULL);