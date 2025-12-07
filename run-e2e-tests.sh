#!/bin/bash

# Script para executar testes E2E com verificações automáticas
# Uso: ./run-e2e-tests.sh

set -e

echo "🧪 Preparando para executar testes E2E..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verifica se MongoDB está rodando
check_mongodb() {
    # Tenta várias formas de verificar MongoDB
    if timeout 2 bash -c "echo > /dev/tcp/localhost/27017" 2>/dev/null; then
        echo -e "${GREEN}✓ MongoDB encontrado em localhost:27017${NC}"
        export MONGODB_URI="mongodb://localhost:27017/gdash-test"
        return 0
    elif docker ps | grep -q mongo; then
        echo -e "${GREEN}✓ MongoDB rodando no Docker${NC}"
        export MONGODB_URI="mongodb://localhost:27017/gdash-test"
        return 0
    else
        echo -e "${YELLOW}⚠ MongoDB não encontrado${NC}"
        return 1
    fi
}

# Verifica se mongodb-memory-server está instalado
check_memory_server() {
    if npm list mongodb-memory-server --depth=0 2>/dev/null | grep -q mongodb-memory-server; then
        echo -e "${GREEN}✓ mongodb-memory-server instalado${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ mongodb-memory-server não instalado${NC}"
        return 1
    fi
}

# Tenta encontrar uma solução
echo ""
echo "Verificando opções disponíveis:"
echo ""

if check_mongodb; then
    echo ""
    echo -e "${GREEN}✅ Usando MongoDB local${NC}"
    echo ""
    npm run test:e2e
    exit 0
fi

if check_memory_server; then
    echo ""
    echo -e "${GREEN}✅ Usando MongoDB Memory Server${NC}"
    echo ""
    npm run test:e2e
    exit 0
fi

# Nenhuma opção disponível
echo ""
echo -e "${RED}❌ Nenhum MongoDB disponível!${NC}"
echo ""
echo "Escolha uma das opções:"
echo ""
echo "1️⃣  Iniciar MongoDB com Docker:"
echo "   ${YELLOW}docker-compose up mongodb -d${NC}"
echo "   ${YELLOW}./run-e2e-tests.sh${NC}"
echo ""
echo "2️⃣  Instalar MongoDB Memory Server (recomendado):"
echo "   ${YELLOW}npm install -D mongodb-memory-server${NC}"
echo "   ${YELLOW}./run-e2e-tests.sh${NC}"
echo ""
echo "3️⃣  Rodar apenas testes unitários:"
echo "   ${YELLOW}npm test${NC}"
echo ""
exit 1
