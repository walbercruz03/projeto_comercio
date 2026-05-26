-- 1. Tabela de Usuários (Sintaxe SQLite)
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  cpf TEXT UNIQUE,
  data_nascimento TEXT,
  email TEXT UNIQUE,
  telefone TEXT,
  senha TEXT
);

-- 2. Tabela de Produtos (Sintaxe SQLite)
CREATE TABLE IF NOT EXISTS produto (
  id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  descricao TEXT,
  preco REAL,
  estoque INTEGER,
  imagem TEXT NULL
);

-- 3. Tabela de Pedidos (Sintaxe SQLite)
CREATE TABLE IF NOT EXISTS pedido (
  id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER NOT NULL,
  data_pedido TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- 4. Tabela de Itens do Pedido (Sintaxe SQLite)
CREATE TABLE IF NOT EXISTS pedido_item (
  id_item INTEGER PRIMARY KEY AUTOINCREMENT,
  id_pedido INTEGER,
  id_produto INTEGER,
  quantidade INTEGER,
  preco_unitario REAL,
  FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),
  FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);

-- Inserir o Admin Oficial no SQLite (Se já existir, ignora)
INSERT OR IGNORE INTO usuario (nome, cpf, data_nascimento, email, telefone, senha) 
VALUES ('Administrador', '000.000.000-00', '2000-01-01', 'admin@gmail.com', '(00) 00000-0000', 'admin123');

-- Inserir Produtos de Teste no SQLite
INSERT INTO produto (nome, descricao, preco, estoque, imagem) VALUES 
('Teclado Mecânico', 'Teclado RGB com switch azul', 250.00, 15, NULL),
('Mouse Gamer', 'Mouse de 12000 DPI com botões laterais', 150.00, 20, NULL);