# Delta Spec: Inversão de Fluxo de Compra & Customização Granular por Tela

## 1. Contexto Atual
- Originalmente, as rotas `/produtos` e `/carrinho` exigiam autenticação prévia obrigatória via middleware `verificarTokenView`.
- O cliente era forçado a passar pela tela de login antes de conhecer o catálogo de mercadorias.
- A logo corporativa e as cores de fundo de todas as interfaces eram estáticas, definidas diretamente nos arquivos CSS/HTML.

## 2. Nova Regra de Negócio

### Fluxo do Cliente (Loja Aberta & Checkout Controlado)
1. **Vitrine Pública:** A rota raiz `/` e a rota `/produtos` utilizam o middleware `verificarTokenOpcional`. O cliente pode navegar livremente pelos produtos e gerenciar itens no carrinho local (`localStorage`) sem estar logado.
2. **Intercepção de Segurança:** Ao acessar a página `/carrinho`, os itens salvos em memória são renderizados pelo front-end. No momento em que o cliente clica no botão "Finalizar Compra", o front-end dispara a requisição para a API.
3. **Bloqueio Reativo:** Caso o backend retorne o status `401 Unauthorized` (sinalizando que não há um Token JWT válido no Cookie HttpOnly), o front-end intercepta a resposta, avisa o usuário através de um alerta e o redireciona imediatamente para a tela de `/login`. O carrinho permanece intacto no navegador para conclusão pós-autenticação.

### Fluxo do Admin (Customização Seletiva de Telas)
1. O Administrador pode gerenciar a identidade visual da plataforma diretamente de um novo painel integrado à view `admin.ejs`.
2. Através de um campo de seleção (`<select>`), o Admin escolhe especificamente **qual página do sistema** deseja modificar (Vitrine, Carrinho, Login, Cadastro ou Dashboard).
3. O Admin define a cor de fundo da tela escolhida (via input `color`), a cor primária global de botões/destaques e realiza o upload de um novo arquivo de imagem para atualizar a logo corporativa do e-commerce de ponta a ponta.

---

## 3. Impacto no Banco de Dados (PostgreSQL)

Para dar suporte ao gerenciamento dinâmico de cores por tela e armazenamento da logo, adicionou-se a tabela `configuracao_sistema` no formato **Chave-Valor**, permitindo flexibilidade total nas propriedades visuais:

```sql
CREATE TABLE IF NOT EXISTS configuracao_sistema (
  id SERIAL PRIMARY KEY,
  chave VARCHAR(50) UNIQUE NOT NULL,
  valor TEXT NOT NULL
);

-- Carga inicial com as novas chaves individualizadas por página
INSERT INTO configuracao_sistema (chave, valor) VALUES 
('logo_url', '/images/logo-placeholder.png'),
('cor_primaria', '#0d6efd'),
('cor_fundo_produtos', '#ffffff'),
('cor_fundo_carrinho', '#ffffff'),
('cor_fundo_login', '#ffffff'),
('cor_fundo_cadastro', '#ffffff'),
('cor_fundo_dashboard', '#ffffff')
ON CONFLICT (chave) DO NOTHING;