FROM python:3.11-slim

# Variáveis de ambiente para o Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Diretório de trabalho dentro do container
WORKDIR /app

# Instala dependências do sistema necessárias para compilar bibliotecas (como mysqlclient/psycopg2)
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copia e instala as dependências do projeto listadas no requirements.txt
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia o restante do código do backend para dentro do container
COPY . /app/

# Expõe a porta padrão do Django
EXPOSE 8000

# Comando para iniciar o servidor de produção com Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]