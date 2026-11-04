
# 🍔 DeliverFlow AI

> Ecossistema de alta performance para gestão de delivery, operações de restaurantes e inteligência de recomendação preditiva com suporte a rotas via GPS.

[![Python](https://img.shields.io/badge/Python-3.12%2B-blue?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.x-green?style=flat&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-ML-orange?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 🧭 1. Contexto
O mercado moderno de entrega de alimentos exige plataformas capazes de lidar com alta concorrência, consistência transacional rigorosa e personalização em tempo real para reter usuários. O **DeliverFlow AI** nasce para endereçar os principais desafios de arquitetura de um ecossistema de marketplace de delivery — conectando eficientemente três pontas críticas: **Consumidores, Parceiros (Restaurantes) e Operações Logísticas**.

---

## 🎯 2. Tarefa (Escopo Técnico)
Este repositório implementa uma solução completa (Full Stack + Machine Learning) estruturada em microsserviços modulares:
* **Backend Robusto (Django & DRF):** API RESTful desacoplada com modelagem relacional orientada a domínios (`accounts`, `restaurants`, `orders`, `analytics`), garantindo integridade transacional no ciclo de vida dos pedidos e controle de concorrência de estoque.
* **Motor Logístico Preditivo via GPS:** Cálculo em tempo real do tempo de entrega baseando-se na **Fórmula de Haversine** entre as coordenadas de GPS do cliente (capturadas via Web Geolocation API) e o endereço fixo do restaurante, combinadas com fatores de complexidade do pedido (quantidade de itens).
* **Motor de Recomendação Personalizado:** Algoritmo ponderado por frequência de consumo (`OrderItem`) e preferências de categoria do utilizador autenticado, com fallback para popularidade global.
* **Painel de Operações (React & Tailwind CSS):** Interface de gestão em tempo real para acompanhamento de pedidos e alteração de estados (*Pendente* ➔ *Em Preparo* ➔ *Saiu para Entrega* ➔ *Concluído*).
* **Prontidão para Produção (Docker):** Ambientes conteinerizados padronizados para garantir reprodutibilidade e escalabilidade.

---

## 📐 3. Algoritmos e Inteligência Preditiva

### A. Cálculo Logístico de Entrega (Fórmula de Haversine)
A estimativa dinâmica de entrega utiliza a distância real percorrida pelo entregador ($d$):

$$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1) \cos(\phi_2) \sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

* **Fórmula de Tempo Estimado:**
  $$\text{Tempo Estimado (min)} = T_{\text{preparo base}} + (d \times \text{Fator por km}) + (\text{Itens} \times \text{Fator de Complexidade})$$

---

## 📊 4. Matriz de Funcionalidades (Status do Projeto)

| Funcionalidade | Descrição | Status |
| --- | --- | --- |
| **Autenticação JWT/Session** | Login/Registro diferenciado por perfis (*Cliente*, *Restaurante*). | 🟢 Concluído |
| **Gestão de Cardápios & Lojas** | CRUD completo de restaurantes e itens com imagens e preços. | 🟢 Concluído |
| **Motor Logístico de GPS (ETA)** | Previsão dinâmica via Haversine + itens do carrinho (`lat`/`lon`). | 🟢 Concluído |
| **Recomendação por Histórico** | Sugestões baseadas na frequência individual do cliente. | 🟢 Concluído |
| **Suíte de Testes da API** | Testes automatizados (`apps.analytics.tests`) cobrindo endpoints e BD. | 🟢 Concluído |
| **Integração Google Maps/Directions API** | Roteamento com trânsito em tempo real e mapa interativo. | 🟡 Roadmap (Fase 2) |
| **WebSockets (Django Channels)** | Atualizações de status do pedido sem polling no React. | 🟡 Roadmap (Fase 2) |

---

## 🧑‍💻 5. Persona
Projeto desenvolvido com foco em **Engenheiros de Software Backend, Arquitetos de Plataforma e Cientistas de Dados** que avaliam código limpo, separação de responsabilidades (SoC), padrões RESTful, modelagem de dados orientada a integridade e aplicação prática de Machine Learning em produtos reais.

---

## 🛠️ 6. Formato e Arquitetura do Repositório

### Estrutura de Pastas
```text
deliverflow-ai/
├── backend/
│   ├── apps/
│   │   ├── accounts/       # Gestão de perfis (Cliente, Restaurante, Entregador)
│   │   ├── restaurants/    # Catálogo, Lojas, Endereços GPS e Itens de Cardápio
│   │   ├── orders/         # Máquina de estados transacional e itens
│   │   └── analytics/      # Motor de recomendação, testes e modelos preditivos
│   ├── core/               # Configurações globais do Django (settings, urls)
│   ├── Dockerfile
│   └── manage.py
├── frontend/
│   ├── src/                # Componentes React, serviços de API e Tailwind
│   └── package.json
├── docker-compose.yml
└── README.md

```

---

### 🚀 Como Executar o Projeto Localmente

Clone o repositório e siga os passos abaixo para subir o ambiente:

#### 1. Configurando e Rodando o Backend (Django)

```bash
# Entre na pasta do backend
cd backend

# Crie e ative o ambiente virtual
python -m venv venv
# No Windows (PowerShell):
.\venv\Scripts\Activate

# Instale as dependências
pip install django djangorestframework mysqlclient scikit-learn pandas

# Execute as migrações do banco de dados
python manage.py makemigrations accounts restaurants orders
python manage.py migrate

# Execute a suíte de testes unitários para validar a API
python manage.py test apps.analytics.tests

# Inicie o servidor de desenvolvimento
python manage.py runserver

```

O backend estará acessível em `http://127.0.0.1:8000/api/`.

#### 2. Configurando e Rodando o Frontend (React + Vite)

Em outro terminal, na raiz do projeto:

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie a aplicação
npm run dev

```

O frontend estará rodando em `http://localhost:5173`.

---

### 📡 Endpoints Principais da API REST

| Verbo | Rota | Descrição |
| --- | --- | --- |
| `GET / POST` | `/api/restaurants/` | Lista restaurantes ou cadastra novo estabelecimento. |
| `GET / POST` | `/api/orders/` | Lista pedidos ou realiza um novo pedido com cálculo automático de total. |
| `PATCH` | `/api/orders/{id}/update_status/` | Atualiza o status operacional do pedido (Painel do Restaurante). |
| `GET` | `/api/analytics/recommendations/?item_count={n}&restaurant_id={id}&lat={lat}&lon={lon}` | Retorna pratos recomendados e cálculo dinâmico de tempo por GPS. |

---

*Desenvolvido com foco em engenharia de alta performance.*

