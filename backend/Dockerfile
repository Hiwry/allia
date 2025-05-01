# Usa uma imagem oficial do Node.js
FROM node:20

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código-fonte
COPY . .

# Expõe a porta usada pelo seu app (ex: 3000)
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "src/index.js"]