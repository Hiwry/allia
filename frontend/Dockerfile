# Usa uma imagem oficial do Node.js para o frontend (React)
FROM node:20

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código-fonte
COPY . .

# Build da aplicação React
RUN npm run build

# Usa o servidor http-server para servir o build (pode ser substituído por nginx, se preferir)
RUN npm install -g http-server

# Expõe a porta padrão do http-server
EXPOSE 3000

# Comando para rodar o servidor
CMD ["http-server", "./build", "-p", "3000"]
