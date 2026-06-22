## Especificação Global do Sistema: Wc Variedades

## 1. Visão Geral da Arquitetura
O sistema consiste em uma plataforma de e-commerce e gestão de vendas construída com **Node.js, Express, Sequelize ORM** e banco de dados **PostgreSQL**. A renderização de telas utiliza o motor de visualização **EJS (Embedded JavaScript)**.

O sistema divide-se estritamente em duas áreas de experiência:
- **Área do Cliente:** Cadastro, login, visualização de vitrine de produtos, carrinho de compras e histórico de pedidos pessoais.
- **Área Administrativa:** Dashboard financeiro, gerenciamento do catálogo de produtos e gerenciamento de administradores secundários (restrito ao administrador principal).

---

## 2. Modelo de Autenticação e Segurança (RBAC)
A autenticação é baseada em tokens **JWT** injetados e validados via Cookies HttpOnly. O sistema diferencia três níveis de privilégios (`tipo_usuario`):

1. **admin_principal**: Vinculado estritamente ao e-mail estático `admin@gmail.com`. É o único com permissão para gerenciar outros administradores. Seu ID no payload JWT é fixado em `0`.
2. **admin**: Administradores secundários cadastrados no banco de dados. Possuem acesso ao Dashboard, Catálogo e Cadastro de Produtos, mas não gerenciam outros admins.
3. **cliente**: Usuários comuns cadastrados no banco de dados. Possuem acesso exclusivo ao fluxo de compra (Carrinho, Vitrine de Clientes e Meus Pedidos).

---

## 3. Estrutura do Banco de Dados (PostgreSQL)

### Tabela: `usuario`
Guarda as credenciais e dados dos clientes logados.
- `id_usuario` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR)
- `cpf` (VARCHAR)
- `data_nascimento` (DATE)
- `email` (VARCHAR)
- `telefone` (VARCHAR)
- `senha` (VARCHAR)

### Tabela: `administrador`
Guarda as credenciais de administradores secundários.
- `id_admin` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `senha` (VARCHAR)

### Tabela: `produto`
Guarda o catálogo ativo da loja.
- `id_produto` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR)
- `descricao` (TEXT)
- `preco` (DECIMAL(10,2))
- `estoque` (INT)
- `imagem` (VARCHAR, NULL) - *Armazena o filename salvo em `/public/uploads/`*
- `categoria` (VARCHAR, DEFAULT 'Geral')

### Tabela: `pedido`
- `id_pedido` (SERIAL PRIMARY KEY)
- `id_usuario` (INT, FK -> usuario.id_usuario ON DELETE CASCADE)
- `data_pedido` (TIMESTAMP)

### Tabela: `pedido_item`
Tabela pivô de relacionamento Muitos-para-Muitos entre pedidos e produtos.
- `id_item` (SERIAL PRIMARY KEY)
- `id_pedido` (INT, FK -> pedido.id_pedido ON DELETE CASCADE)
- `id_produto` (INT, FK -> produto.id_produto ON DELETE RESTRICT)
- `quantidade` (INT)
- `preco_unitario` (DECIMAL(10,2))

---

## 4. Mapeamento de Rotas e Telas (Fluxos Atuais)

### Rotas de Views (`/routes/viewRoutes.js`)
| Endpoint | View EJS | Permissão | Descrição |
| :--- | :--- | :--- | :--- |
| `/` ou `/login` | `login` | Pública | Tela de login (E-mail/Senha ou Google Auth) |
| `/cadastro` | `cadastro` | Pública | Tela de cadastro de novos clientes |
| `/recuperar-senha` | `recuperar_senha` | Pública | Atualização de senha via Email e CPF |
| `/apresentacao` | `apresentacao` | Opcional | Landing page ou vitrine pública inicial |
| `/produtos` | `produtos` | `verificarTokenView` | Vitrine de produtos (Adapta layout se for Admin) |
| `/carrinho` | `carrinho` | `verificarTokenView` | Visualização e fechamento de itens do carrinho |
| `/meus_pedidos` | `meus_pedidos` | `verificarTokenView` | Histórico de compras do próprio cliente logado |
| `/dashboard` | `dashboard` | `apenasAdminView` | Gráficos financeiros e faturamento total |
| `/admin` | `admin` | `apenasAdminView` | Painel de cadastro/edição de novos produtos |
| `/gerenciar_admins` | `gerenciar_admins`| `apenasAdminView` | Exclusivo para o `admin_principal` gerir sub-admins |

---

## 5. Regras de Negócio Críticas Existentes
- **Baixa de Estoque:** Ao chamar o endpoint `/api/pedidos/finalizar`, o sistema abre uma transação SQL gerenciada pelo Sequelize. Se todos os itens estiverem disponíveis, insere o pedido, os itens na tabela `pedido_item` e decrementa o estoque físico correspondente na tabela `produto`. Qualquer falha dispara um `rollback`.
- **Upload de Arquivos:** Imagens de produtos enviados via painel administrativo passam pelo middleware do `multer`, que renomeia o arquivo com um sufixo temporal único e o salva fisicamente na pasta pública estruturada em `../public/uploads/`.
- **Filtro do Dashboard:** O método `buscarDadosDashboard` realiza o processamento analítico em memória JavaScript para evitar JOINs custosos no banco de dados, montando um ranking dinâmico do top 5 produtos mais vendidos e faturamento por período.