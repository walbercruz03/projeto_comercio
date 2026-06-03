# 1. comando serve para entrar no terminal interativo do MySQL direto pela linha de comando do seu Ubuntu.
mysql -h 127.0.0.1 -P 3307 -u root -p

# 2. Derruba os contêineres e limpa os volumes antigos de banco de dados
docker compose down -v

# 3. Sobe o projeto criando o banco e rodando o init.sql
docker compose up --build