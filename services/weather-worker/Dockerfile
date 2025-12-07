FROM golang:1.21-alpine

WORKDIR /app

# Copia dependências
COPY go.mod go.sum ./
RUN go mod download

# Copia o código fonte
COPY . .

# Build from cmd/worker/main.go (refactored SOLID structure)
RUN go build -o /usr/local/bin/weather-worker-bin ./cmd/worker

CMD ["weather-worker-bin"]
