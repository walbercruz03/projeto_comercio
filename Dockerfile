# 1. Uma imagem oficial do Node.js (versão LTS é recomendada)
FROM node:20-alpine

# 2. Define o diretório de trabalho dentro do container
WORKDIR /app

# 3. Copia os arquivos de configuração de dependências
COPY package*.json ./

# 4. Instala as dependências do projeto
RUN npm install

# 5. Copia o restante dos arquivos do seu projeto para o container
COPY . .

# 6. Expõe a porta que o seu server.js está escutando (ex: 3000, 5000, etc.)
EXPOSE 3000

# 7. Comando para iniciar a aplicação
CMD ["node", "server.js"]