-- Nota: Certifique-se de criar o banco 'comercio' antes de rodar este script,
-- ou configure o Docker/Postgres para criá-lo automaticamente.

-- 1. Tabela de Usuários (Apenas Clientes)
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario SERIAL PRIMARY KEY,
  nome VARCHAR(50),
  cpf VARCHAR(50),
  data_nascimento DATE,
  email VARCHAR(50),
  telefone VARCHAR(50),
  senha VARCHAR(50)
);

-- 1.5. Tabela Exclusiva para Administradores Secundários
CREATE TABLE IF NOT EXISTS administrador (
  id_admin SERIAL PRIMARY KEY,
  nome VARCHAR(50),
  email VARCHAR(50) UNIQUE,
  senha VARCHAR(50)
);

-- 2. Tabela de Produtos
CREATE TABLE IF NOT EXISTS produto (
  id_produto SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  descricao TEXT,
  preco DECIMAL(10,2),
  estoque INT,
  imagem VARCHAR(255) NULL,
  categoria VARCHAR(50) DEFAULT 'Geral'
);

-- 3. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedido (
  id_pedido SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL,
  data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- 4. Tabela de Itens do Pedido (Relacionamento Muitos para Muitos)
CREATE TABLE IF NOT EXISTS pedido_item (
  id_item SERIAL PRIMARY KEY,
  id_pedido INT,
  id_produto INT,
  quantidade INT,
  preco_unitario DECIMAL(10,2),
  CONSTRAINT fk_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON DELETE CASCADE,
  CONSTRAINT fk_produto FOREIGN KEY (id_produto) REFERENCES produto(id_produto) ON DELETE RESTRICT
);

-- Inserção de dados iniciais (Campos de texto usam aspas simples '' no padrão SQL)
INSERT INTO produto (nome, descricao, preco, estoque, imagem, categoria) VALUES 
('Teclado Mecânico', 'Teclado RGB com switch azul, ABNT2.', 250.00, 15, NULL, 'Periféricos'),
('Mouse Gamer', 'Mouse de 12000 DPI com botões laterais.', 150.00, 20, NULL, 'Periféricos'),
('Monitor 24" Full HD', 'Monitor 75Hz com painel IPS e design sem bordas.', 850.00, 10, NULL, 'Monitores')
ON CONFLICT DO NOTHING;