# Base Image leve e segura
FROM node:22-alpine

# Diretório de trabalho
WORKDIR /app

# 1. Copia apenas arquivos de dependência primeiro (Melhor uso de cache)
COPY package.json package-lock.json ./

# 2. Instala dependências
RUN npm install

# 3. Copia o restante do código
COPY . .

# Expondo a porta padrão do Vite
EXPOSE 5173

# Comando de inicialização
# O "--host" é OBRIGATÓRIO para o Vite aceitar conexões fora do container
CMD ["npm", "run", "dev", "--", "--host"]
