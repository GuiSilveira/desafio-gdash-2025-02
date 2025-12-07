# Atualizado para Node 22 (necessário para GenAI e NestJS 11)
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]
