FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
# Instala dependencias se o arquivo existir, senao ignora
RUN if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
COPY . .
CMD ["python", "main.py"]
