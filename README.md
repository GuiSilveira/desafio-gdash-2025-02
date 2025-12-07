# PokeNimbus Weather Monitoring System - Documentacao

Sistema de monitoramento meteorologico desenvolvido para o processo seletivo GDASH 2025/02.

## Video Explicativo

[Link do video no YouTube - nao listado](https://youtu.be/z4k8Q4hcWOE)

## Arquitetura

O sistema utiliza uma arquitetura de microservicos com as seguintes tecnologias:

```
+-------------------+     +-------------------+     +-------------------+
|  Weather Collector|     |     RabbitMQ      |     |  Weather Worker   |
|     (Python)      |---->|  (Message Broker) |---->|       (Go)        |
+-------------------+     +-------------------+     +--------+----------+
                                                             |
                                                             v
                          +-------------------+     +-------------------+     +-------------------+
                          |     Web App       |     |    Core API       |     |     MongoDB       |
                          |  (React + Vite)   |<--->|    (NestJS)       |<--->|    (Database)     |
                          +-------------------+     +-------------------+     +-------------------+
```

### Servicos

| Servico | Tecnologia | Descricao |
|---------|------------|-----------|
| **weather-collector** | Python 3.10 + Pydantic | Coleta dados meteorologicos da API Open-Meteo a cada hora |
| **weather-worker** | Go 1.21 | Consome mensagens do RabbitMQ e envia para a API |
| **core-api** | NestJS 11 + TypeScript + MongoDB | API principal com autenticacao JWT, CRUD de usuarios e dados meteorologicos |
| **web-app** | React 19 + Vite + TanStack Router + Tailwind + shadcn/ui | Frontend com dashboard, gerenciamento de usuarios e integracao com PokeAPI |
| **mongodb** | MongoDB 6.0 | Banco de dados NoSQL |
| **rabbitmq** | RabbitMQ 3 + Management UI | Message broker para comunicacao assincrona |

## Como Executar

### Pre-requisitos

- Docker e Docker Compose instalados
- Portas livres: 27017 (MongoDB), 5672/15672 (RabbitMQ), 3000 (API), 5173 (Frontend)

### Passo a Passo

1. **Clone o repositorio:**
   ```bash
   git clone <url-do-repositorio>
   cd desafio-gdash-2025-02
   ```

2. **Configure as variaveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env conforme necessario
   ```

3. **Suba todos os servicos:**
   ```bash
   docker-compose up --build
   ```

4. **Aguarde a inicializacao:**
   - O MongoDB e RabbitMQ inicializam primeiro
   - A API sobe apos o MongoDB estar saudavel
   - O Frontend sobe apos a API
   - O Collector e Worker sobem apos o RabbitMQ e API

5. **Acesse a aplicacao:**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000
   - Swagger: http://localhost:3000/api/docs
   - RabbitMQ UI: http://localhost:15672

## URLs e Acessos

| Servico | URL | Credenciais |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Use o usuario padrao abaixo |
| **API** | http://localhost:3000 | - |
| **Swagger** | http://localhost:3000/api/docs | Use o JWT obtido via login |
| **RabbitMQ UI** | http://localhost:15672 | gdash / gdash123 |
| **MongoDB** | localhost:27017 | root / root123 |

## Usuario Padrao

O sistema cria automaticamente um usuario administrador na inicializacao:

| Campo | Valor |
|-------|-------|
| **Email** | admin@gdash.com |
| **Senha** | 123456 |
| **Perfil** | admin |

> Voce pode alterar essas credenciais via variaveis de ambiente `ADMIN_EMAIL` e `ADMIN_PASS`.

## Fluxo de Dados Meteorologicos

1. **Coleta (Python):**
   - O `weather-collector` busca dados da API Open-Meteo a cada 5min.
   - Dados coletados: temperatura, umidade, condicao do ceu, indice UV, qualidade do ar e outros.
   - Cidade padrao: Caruaru, PE (configuravel via variaveis de ambiente)

2. **Fila (RabbitMQ):**
   - Os dados sao enviados para a fila `weather_queue`
   - Formato: JSON com timestamp, localizacao e dados meteorologicos

3. **Processamento (Go):**
   - O `weather-worker` consome as mensagens da fila
   - Valida e transforma os dados
   - Envia para a API via POST `/external/weather`
   - Implementa retry

4. **Armazenamento (NestJS + MongoDB):**
   - A API recebe os dados via endpoint protegido
   - Armazena na colecao `weather_logs`
   - Gera insights de IA usando a API Gemini

5. **Visualizacao (React):**
   - Dashboard exibe cards com dados atuais
   - Graficos de temperatura e umidade ao longo do tempo
   - Tabela com historico e opcoes de filtro/ordenacao
   - Exportacao em CSV/XLSX

## Funcionalidades

### Dashboard
- Cards com temperatura atual, umidade, vento, condicao do ceu
- Graficos de temperatura maxima/minima
- Grafico de probabilidade de chuva
- Tabela de registros com ordenacao e filtros
- Insights de IA baseados nos dados meteorologicos
- Exportacao de dados (CSV/XLSX)

### Gerenciamento de Usuarios
- CRUD completo de usuarios
- Autenticacao via JWT
- Controle de acesso por perfil (admin/user)
- Pagina de conta do usuario

### Integracao com PokeAPI (Opcional)
- Listagem de Pokemons com paginacao
- Busca por nome
- Detalhes de cada Pokemon

## Estrutura de Diretorios

```
desafio-gdash-2025-02/
├── services/
│   ├── core-api/          # Backend NestJS
│   │   ├── src/
│   │   │   ├── ai/        # Modulo de IA (Gemini)
│   │   │   ├── auth/      # Autenticacao JWT
│   │   │   ├── common/    # Utilidades compartilhadas
│   │   │   ├── external/  # Endpoints para servicos externos
│   │   │   ├── health/    # Health check
│   │   │   ├── users/     # CRUD de usuarios
│   │   │   └── weather/   # Dados meteorologicos
│   │   └── test/          # Testes E2E
│   │
│   ├── web-app/           # Frontend React
│   │   ├── src/
│   │   │   ├── components/    # Componentes reutilizaveis
│   │   │   ├── features/      # Paginas por feature
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── contexts/      # Contextos React
│   │   │   └── routes/        # Rotas TanStack Router
│   │   └── e2e/           # Testes E2E Playwright
│   │
│   ├── weather-collector/ # Coletor Python
│   │   ├── src/
│   │   │   ├── protocols/ # Interfaces
│   │   │   ├── providers/ # Implementacoes de API
│   │   │   └── queue/     # Integracao RabbitMQ
│   │   └── tests/         # Testes unitarios
│   │
│   └── weather-worker/    # Worker Go
│       ├── cmd/worker/    # Entrypoint
│       └── internal/
│           ├── api/       # Cliente HTTP
│           ├── config/    # Configuracao
│           ├── logger/    # Logging estruturado
│           ├── queue/     # Consumidor RabbitMQ
│           └── worker/    # Logica principal
│
├── docker-compose.yml     # Orquestracao dos servicos
├── .env.example           # Template de variaveis de ambiente
└── README_EXPLICACAO.md   # Este arquivo
```

## Comandos Uteis

### Logs dos Servicos
```bash
# Todos os servicos
docker-compose logs -f

# Servico especifico
docker-compose logs -f core-api
docker-compose logs -f weather-collector
docker-compose logs -f weather-worker
```

### Rebuild de Servicos
```bash
# Rebuild completo
docker-compose up --build

# Rebuild de um servico especifico
docker-compose up --build core-api
```

### Parar e Limpar
```bash
# Parar servicos
docker-compose down

# Parar e remover volumes (limpa banco de dados)
docker-compose down -v
```

### Desenvolvimento Local

```bash
# Core API (from services/core-api/)
npm run start:dev    # Modo desenvolvimento
npm run test         # Testes unitarios
npm run test:e2e     # Testes E2E

# Web App (from services/web-app/)
npm run dev          # Servidor de desenvolvimento
npm run test         # Testes unitarios
npm run e2e          # Testes E2E Playwright

# Weather Collector (from services/weather-collector/)
pytest               # Testes unitarios

# Weather Worker (from services/weather-worker/)
go test ./...        # Testes unitarios
```

## Variaveis de Ambiente

Consulte o arquivo `.env.example` para a lista completa de variaveis de ambiente e seus valores padrao.

### Variaveis Principais

| Variavel | Descricao | Padrao |
|----------|-----------|--------|
| `MONGO_INITDB_ROOT_USERNAME` | Usuario root do MongoDB | root |
| `MONGO_INITDB_ROOT_PASSWORD` | Senha root do MongoDB | root123 |
| `JWT_SECRET` | Segredo para assinatura JWT | jwt-secret-key |
| `ADMIN_EMAIL` | Email do usuario admin padrao | admin@gdash.com |
| `ADMIN_PASS` | Senha do usuario admin padrao | 123456 |
| `GEMINI_API_KEY` | Chave da API Google Gemini | (obrigatoria para IA) |
| `TARGET_CITY` | Cidade para coleta de dados | Caruaru |

## Logs Estruturados

Todos os servicos implementam logging estruturado com prefixos emoji para facilitar a identificacao:

- `🚀` - Inicializacao
- `✅` - Sucesso
- `❌` - Erro
- `⚠️` - Aviso
- `🌤️` - Dados meteorologicos
- `🐰` - RabbitMQ
- `📡` - Requisicoes HTTP

## Testes

O projeto inclui testes em todos os servicos:

| Servico | Tipo | Comando |
|---------|------|---------|
| core-api | Unitarios | `npm test` |
| core-api | E2E | `npm run test:e2e` |
| web-app | Unitarios | `npm test` |
| web-app | E2E | `npm run e2e` |
| weather-collector | Unitarios | `pytest` |
| weather-worker | Unitarios | `go test ./...` |

## Troubleshooting

### Erro de conexao com MongoDB
- Verifique se a porta 27017 esta livre
- Aguarde o healthcheck do MongoDB passar (pode levar alguns segundos)

### Erro de conexao com RabbitMQ
- Verifique se as portas 5672 e 15672 estao livres
- Aguarde o healthcheck do RabbitMQ passar

### Frontend nao conecta na API
- Verifique se a API esta rodando na porta 3000
- Verifique a variavel `VITE_API_URL` no frontend

### Worker nao processa mensagens
- Verifique os logs do worker: `docker-compose logs -f weather-worker`
- Confirme que o RabbitMQ esta acessivel
- Verifique o `INTERNAL_API_TOKEN`

## Melhorias Futuras

### 1. Monitoramento Multi-Cidade com Mapa Interativo

**Situacao Atual:** O sistema monitora apenas uma cidade (Caruaru, PE) configurada via variaveis de ambiente.

**Melhoria Proposta:**
- Permitir que usuarios adicionem multiplas cidades para monitoramento simultaneo
- Implementar um mapa interativo (Leaflet/Mapbox) no dashboard mostrando todas as cidades monitoradas
- Visualizacao geografica com marcadores coloridos indicando condicoes climaticas
- Comparativo lado a lado entre cidades
- Alertas personalizados por cidade

**Impacto:** Transformaria o sistema de um monitor local em uma plataforma de monitoramento regional/nacional, util para empresas com operacoes distribuidas geograficamente (como usinas fotovoltaicas em diferentes locais).

---

### 2. Sistema de Alertas e Notificacoes em Tempo Real

**Situacao Atual:** Os dados sao coletados e exibidos, mas nao ha notificacoes proativas.

**Melhoria Proposta:**
- Implementar WebSockets (Socket.io) para atualizacoes em tempo real no dashboard
- Sistema de alertas configuravel por usuario (ex: "Avise-me se temperatura > 35C")
- Integração com servicos de notificacao:
  - Push notifications no navegador
  - Integração com Slack/Discord via webhooks
  - Envio de emails via SendGrid/SES
  - SMS para alertas criticos via Twilio
- Historico de alertas disparados

**Impacto:** Permitiria acao preventiva baseada em condicoes climaticas, crucial para operacoes de energia solar onde condicoes extremas afetam a producao.

---

### 3. Machine Learning para Previsao de Producao de Energia

**Situacao Atual:** A IA gera insights descritivos sobre o clima atual e historico.

**Melhoria Proposta:**
- Treinar modelo de ML correlacionando dados climaticos com producao de energia fotovoltaica
- Previsao de geracao de energia para as proximas 24-72 horas
- Analise de tendencias sazonais e padroes historicos
- Deteccao de anomalias (producao abaixo do esperado dado o clima)
- Dashboard com metricas de performance das usinas
- Recomendacoes automaticas de manutencao baseadas em padroes

**Impacto:** Agregaria valor direto ao negocio da GDASH, permitindo melhor planejamento financeiro e operacional das usinas fotovoltaicas.

---

### 4. Arquitetura Event-Driven com CQRS e Event Sourcing

**Situacao Atual:** Arquitetura tradicional request-response com MongoDB como unico datastore.

**Melhoria Proposta:**
- Implementar CQRS (Command Query Responsibility Segregation):
  - Separar modelos de leitura (otimizados para queries) e escrita (otimizados para consistencia)
  - Read replicas com Redis para queries frequentes do dashboard
- Event Sourcing para dados meteorologicos:
  - Armazenar eventos imutaveis em vez de estado atual
  - Capacidade de reconstruir estado em qualquer ponto no tempo
  - Auditoria completa de todas as mudancas
- Apache Kafka como backbone de eventos:
  - Substituir RabbitMQ para maior throughput e durabilidade
  - Replay de eventos para reprocessamento
  - Integracao com ecossistema de data analytics

**Impacto:** Escalabilidade massiva, melhor separacao de responsabilidades, e fundacao para analytics avancado e data lake.

---

### 5. Observabilidade Completa com OpenTelemetry

**Situacao Atual:** Logs estruturados em cada servico, mas sem correlacao ou metricas centralizadas.

**Melhoria Proposta:**
- Implementar OpenTelemetry para os tres pilares da observabilidade:
  - **Traces distribuidos:** Rastrear requisicoes end-to-end (Collector -> RabbitMQ -> Worker -> API -> Frontend)
  - **Metricas:** Latencia, throughput, taxa de erro, filas, uso de recursos
  - **Logs correlacionados:** Vincular logs ao trace ID para debugging facilitado
- Stack de observabilidade:
  - Jaeger/Tempo para traces
  - Prometheus + Grafana para metricas e dashboards
  - Loki para agregacao de logs
- Alertas baseados em SLOs (Service Level Objectives)
- Dashboards operacionais com health score do sistema

**Impacto:** Visibilidade total do sistema em producao, reducao drastica do MTTR (Mean Time To Recovery), e capacidade de identificar gargalos antes que afetem usuarios.

---

### Resumo das Melhorias

| # | Melhoria | Complexidade | Impacto no Negocio |
|---|----------|--------------|-------------------|
| 1 | Multi-Cidade + Mapa | Media | Alto |
| 2 | Alertas em Tempo Real | Media | Alto |
| 3 | ML para Previsao de Energia | Alta | Muito Alto |
| 4 | CQRS + Event Sourcing | Alta | Medio-Alto |
| 5 | Observabilidade (OpenTelemetry) | Media | Alto |

Essas melhorias transformariam o projeto de um MVP funcional em uma plataforma robusta e escalavel, pronta para uso em producao e alinhada com as necessidades reais de monitoramento de usinas fotovoltaicas.

---

Desenvolvido para o processo seletivo GDASH 2025/02.
