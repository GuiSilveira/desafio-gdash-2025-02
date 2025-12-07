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

<<<<<<< HEAD
3. **Suba todos os servicos:**
   ```bash
   docker-compose up --build
   ```
=======
1. **Coleta dados climáticos** (via **Open-Meteo** ou **OpenWeather**) da sua **cidade/localização**;  
2. **Envia esses dados periodicamente** para uma **fila** (Message Broker, como RabbitMQ ou até Redis), processada por um **worker em Go**;  
3. **Armazena os dados** em uma **API NestJS** com **MongoDB**;  
4. **Exibe um Dashboard** no frontend (React + Vite + Tailwind + shadcn/ui) com os dados coletados;  
5. Gera **insights baseados em IA** a partir das informações climáticas — podendo ser gerados automaticamente, sob demanda, ou de qualquer outra forma que você julgar adequada;  
6. Inclui:
   - **CRUD de usuários** (com autenticação e usuário padrão);
   - **Página opcional** de integração com uma **API pública paginada** (ex.: PokéAPI, Star Wars API, etc.);
   - **Exportação de dados** em **CSV/XLSX**;  
7. Toda a solução deve rodar via **Docker Compose**.
>>>>>>> upstream/main

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

<<<<<<< HEAD
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
=======
- **Frontend:** React + Vite + Tailwind + [shadcn/ui](https://ui.shadcn.com)  
- **Backend (API):** NestJS (TypeScript)  
- **Banco de dados:** MongoDB (Atlas ou container)  
- **Fila:** Go + Message Broker (`RabbitMQ`, `Redis`, etc.)  
- **Coleta de dados:** Python (`requests`, `httpx`, `pandas`, etc.)  
- **APIs externas:**
  - Clima (obrigatória): [Open-Meteo](https://open-meteo.com/) ou [OpenWeather](https://openweathermap.org/)
  - Opcional: qualquer API pública com **paginação**, por exemplo:
    - [PokéAPI](https://pokeapi.co/)
    - [SWAPI (Star Wars API)](https://swapi.dev/)
- **Infra:** Docker / Docker Compose  
- **Linguagem base:** **TypeScript obrigatório** (frontend e backend)
>>>>>>> upstream/main

---

### 3. Machine Learning para Previsao de Producao de Energia

<<<<<<< HEAD
**Situacao Atual:** A IA gera insights descritivos sobre o clima atual e historico.
=======
### 1️⃣ Coleta de dados (Python → Fila)
>>>>>>> upstream/main

**Melhoria Proposta:**
- Treinar modelo de ML correlacionando dados climaticos com producao de energia fotovoltaica
- Previsao de geracao de energia para as proximas 24-72 horas
- Analise de tendencias sazonais e padroes historicos
- Deteccao de anomalias (producao abaixo do esperado dado o clima)
- Dashboard com metricas de performance das usinas
- Recomendacoes automaticas de manutencao baseadas em padroes

<<<<<<< HEAD
**Impacto:** Agregaria valor direto ao negocio da GDASH, permitindo melhor planejamento financeiro e operacional das usinas fotovoltaicas.

---

### 4. Arquitetura Event-Driven com CQRS e Event Sourcing
=======
- Buscar periodicamente (ex.: a cada 1 hora) dados da **previsão do tempo** da sua cidade/localização;  
- Extrair informações relevantes, como (exemplos):
  - Temperatura
  - Umidade
  - Velocidade do vento
  - Condição do céu
  - Probabilidade de chuva  
- Enviar os dados normalizados para uma **fila** em formato **JSON**.

> 🔹 Estrutura do JSON, nomes de campos e cron/intervalo são **livres** — podem ser adaptados conforme sua arquitetura.

O Python é o **produtor dos dados meteorológicos**. A camada de IA pode ser implementada em Python, no NestJS ou em outro serviço, desde que integrada.

---

### 2️⃣ Fila (Go + Message Broker)
>>>>>>> upstream/main

**Situacao Atual:** Arquitetura tradicional request-response com MongoDB como unico datastore.

<<<<<<< HEAD
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
=======
- Consumir mensagens da fila;  
- Validar e transformar os dados, se necessário;  
- Enviar os registros para a **API NestJS** (por exemplo, um endpoint como `POST /api/weather/logs`);  
- Confirmar as mensagens com **ack/nack**, implementar **retry básico**;  
- Registrar logs das operações principais.

> 📘 **Observação:**  
> O nome do endpoint, o body do JSON e a estrutura de erro são **apenas exemplos** neste README.  
> Você pode definir o contrato de comunicação da forma que achar melhor, desde que o fluxo Python → Message Broker → Go → NestJS funcione corretamente.

Bibliotecas sugeridas (não obrigatórias):

- `github.com/rabbitmq/amqp091-go`  
- `encoding/json`  
- `net/http`  
>>>>>>> upstream/main

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

<<<<<<< HEAD
Desenvolvido para o processo seletivo GDASH 2025/02.
=======
#### c) Integração com API pública (opcional)

Como parte opcional do desafio, implemente uma funcionalidade que consuma uma **API pública com paginação**, por exemplo:

- [PokéAPI](https://pokeapi.co/) — listagem de Pokémons + detalhe de um Pokémon;  
- [SWAPI](https://swapi.dev/) — listagem de personagens, planetas ou naves + detalhe.

Sugestão de funcionalidades (opcionais):

- Endpoint no backend que consome a API externa — o frontend não chama a API pública diretamente;  
- Paginação simples;  
- Endpoint de detalhe de um item (ex.: Pokémon, personagem, planeta).

> 🌍 Tanto o nome dos endpoints quanto o desenho das rotas ficam **totalmente a seu critério**.

---

## 🖥️ Frontend (React + Vite + Tailwind + shadcn/ui)

A aplicação frontend deve ser construída com **React + Vite**, estilizada com **Tailwind** e utilizando componentes do **shadcn/ui**.

Ela deve ter, no mínimo, **essas áreas de funcionalidade**:

---

### 🌦️ 1. Dashboard de Clima

O Dashboard será a **página principal** do sistema, exibindo:

- **Dados reais de clima** da sua cidade/localização, obtidos via pipeline Python → Go → NestJS → MongoDB;  
- **Insights de IA** gerados a partir desses dados.

A forma de exibir essas informações é **livre**.

Você pode, por exemplo, incluir:

- **Cards principais** (exemplos):
  - Temperatura atual  
  - Umidade atual  
  - Velocidade do vento  
  - Condição (ensolarado, nublado, chuvoso, etc.)  

- **Gráficos** (exemplos):
  - Temperatura ao longo do tempo;  
  - Probabilidade de chuva ao longo do tempo;  

- **Tabela de registros** (exemplo):
  - Data/hora  
  - Local  
  - Condição  
  - Temperatura  
  - Umidade  
  - Botões para exportar **CSV/XLSX** (integração com os endpoints do backend).

- **Insights de IA** (forma livre), como:
  - Texto explicativo (“Alta chance de chuva nas próximas horas”);  
  - Cards com alertas (“Calor extremo”, “Clima agradável”);  
  - Gráficos ou visualizações adicionais.

> 💡 Tudo acima são **exemplos ilustrativos**.  
> O requisito é: o Dashboard deve **mostrar os dados de clima da região + insights de IA**, mas você decide **como** isso será exibido (layout, tipos de gráfico, componentes etc.).

---

### 🌐 2. Página opcional – API pública paginada

Uma página (por exemplo, `/explorar`) consumindo a funcionalidade opcional do backend que integra com uma API pública paginada.

Exemplos de UX (apenas sugestões):

- Lista de Pokémons com paginação + página de detalhes de um Pokémon;  
- Lista de personagens de Star Wars com paginação + detalhes de um personagem.

---

### 👤 3. Usuários

Requisitos para a parte de usuários:

- Tela de **login**;  
- Rotas protegidas (somente usuário autenticado acessa o Dashboard);  
- CRUD de usuários (listar, criar, editar, remover);  
- Uso de componentes do **shadcn/ui** (Button, Input, Table, Dialog, Toast, etc.);  
- Feedback visual adequado (loading, erro, sucesso).

---

## 📁 Exportação de dados

- O backend deve expor endpoints para exportar dados de clima em **CSV** e **XLSX**;  
- O frontend deve oferecer botões no Dashboard para fazer o download desses arquivos.

---

## 💡 Ideias de insights (para `/api/weather/insights` ou similar)

A forma de aplicar IA é livre. Algumas ideias possíveis:

- Cálculo de média de temperatura e umidade em determinados períodos;  
- Detecção de tendência (temperaturas subindo ou caindo);  
- Pontuação de conforto climático (0–100);  
- Classificação do dia: “frio”, “quente”, “agradável”, “chuvoso”;  
- Alertas: “Alta chance de chuva”, “Calor extremo”, “Frio intenso”;  
- Geração de resumos em texto (ex.: “Nos últimos 3 dias, a temperatura média foi de 28°C, com alta umidade e tendência de chuva no fim da tarde.”).

> 🔍 Os exemplos acima são **sugestões inspiracionais**.  
> O que será implementado (e em qual serviço) fica a seu critério, desde que seja **coerente com os dados de clima**.

---

## 🧠 Critérios de avaliação

- **Funcionalidade completa:** pipeline Python → Message Broker → Go → NestJS → MongoDB → Frontend;  
- **Clareza de arquitetura:** organização de pastas, camadas e responsabilidades;  
- **Qualidade de código:** tipagem, legibilidade, padrões adotados;  
- **Integração entre serviços:** comunicação estável e bem tratada;  
- **Boas práticas:** validação, tratamento de erros, logs, eslint/prettier;  
- **UX:** experiência de uso do Dashboard e das telas;  
- **Criatividade:** na forma de mostrar dados e insights;  
- **Documentação:** README claro, com passos de execução e configuração;  
- **Uso correto do Docker Compose** para subir tudo.

**Bônus (não obrigatório):**

- Logs detalhados por serviço;  
- CI (lint/test) configurado;  
- Dashboard com filtros, múltiplos tipos de gráfico;  
- Deploy em ambiente gratuito (Railway, Render, etc.);  
- Testes automatizados (unitários e/ou e2e).

---

## ⚠️ Regras

- Respeitar termos de uso das APIs utilizadas (Open-Meteo/OpenWeather, PokéAPI, SWAPI, etc.);  
- Não coletar ou armazenar dados pessoais sensíveis;  
- Usar intervalos razoáveis para chamadas às APIs externas;  
- Focar em **integração, clareza e coesão**, não apenas em adicionar complexidade;  
- Você é livre para:
  - Renomear endpoints;
  - Alterar nomes de coleções;
  - Mudar estruturas de diretórios;
  - Escolher bibliotecas auxiliares — desde que a proposta do desafio seja atendida.

---

## 📹 Vídeo obrigatório

Grave um vídeo de **até 5 minutos** explicando:

- Arquitetura geral da aplicação;  
- Pipeline de dados (Python → Message Broker → Go → NestJS → Frontend);  
- Como os insights de IA são gerados e exibidos;  
- Principais decisões técnicas;  
- Demonstração rápida da aplicação rodando via Docker Compose.

O vídeo deve ser enviado via:

- **YouTube (não listado)**.

Inclua o link no README e/ou na descrição do Pull Request.

---

## 🧪 Entrega

A entrega deve ser feita via **Pull Request**, em uma **branch com o seu nome completo**, por exemplo:

- `joao-silva`  
- `maria-fernanda-souza`

O Pull Request deve conter:

- Código do **backend (NestJS)**;  
- Código do **frontend (Vite)**;  
- Código **Python** (coleta de clima);  
- Código **Go** (worker da fila);  
- `docker-compose.yml` com todos os serviços (API, frontend, banco, Message Broker, etc.);  
- Arquivo `.env.example` com todas as variáveis necessárias;  
- Link do vídeo explicativo (YouTube não listado);  
- README com:
  - Como rodar tudo via Docker Compose;  
  - Como rodar o serviço Python;  
  - Como rodar o worker Go;  
  - URLs principais (API, frontend, Swagger, etc.);  
  - Usuário padrão (login/senha) para acesso inicial.

---

## ✅ Checklist rápido

- [ ] Python coleta dados de clima (Open-Meteo ou OpenWeather)  
- [ ] Python envia dados para a fila  
- [ ] Worker Go consome a fila e envia para a API NestJS  
- [ ] API NestJS:
  - [ ] Armazena logs de clima em MongoDB  
  - [ ] Exponde endpoints para listar dados  
  - [ ] Gera/retorna insights de IA (endpoint próprio)  
  - [ ] Exporta dados em CSV/XLSX  
  - [ ] Implementa CRUD de usuários + autenticação  
  - [ ] (Opcional) Integração com API pública paginada  
- [ ] Frontend React + Vite + Tailwind + shadcn/ui:
  - [ ] Dashboard de clima com dados reais  
  - [ ] Exibição de insights de IA  
  - [ ] CRUD de usuários + login  
  - [ ] (Opcional) Página consumindo API pública paginada  
- [ ] Docker Compose sobe todos os serviços  
- [ ] Código em TypeScript (backend e frontend)  
- [ ] Vídeo explicativo (máx. 5 minutos)  
- [ ] Pull Request via branch com seu nome completo  
- [ ] README completo com instruções de execução  
- [ ] Logs e tratamento de erros básicos em cada serviço  

---

Boa sorte! 🚀  
Mostre sua capacidade de integrar múltiplas linguagens e serviços em uma aplicação moderna, escalável e inteligente — unindo **engenharia de dados**, **backend**, **frontend** e **IA aplicada**.
>>>>>>> upstream/main
