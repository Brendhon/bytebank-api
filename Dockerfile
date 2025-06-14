# Use uma imagem oficial do Node como base
FROM node:22-alpine

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie os arquivos package.json e package-lock.json (ou yarn.lock)
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie todo o código fonte para o container
COPY . .

# Compile o TypeScript (assumindo que você tenha script build configurado)
RUN npm run build

# Exponha a porta padrão
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
