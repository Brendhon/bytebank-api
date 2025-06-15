# 🚀 Bytebank API GraphQL

> API GraphQL para o projeto Bytebank Pro, backend separado para microfrontends, utilizando Apollo Server com Express e MongoDB.

---

## 📖 Sobre

Esta API implementa um servidor GraphQL para o Bytebank Pro, onde o front-end está separado em microfrontends (MFEs) com Angular e React. A API é independente, com Docker próprio, podendo ser usada localmente ou em produção.

---

## 🛠 Tecnologias utilizadas

* Node.js + TypeScript
* Apollo Server (versão 4) com Express
* MongoDB (Mongo Atlas para produção, local para desenvolvimento)
* Docker para containerização
* Apollo Sandbox para testes e documentação

---

## ⚙️ Configuração do projeto

### Pré-requisitos

* Node.js (v22+ recomendado)
* Docker (para rodar banco e API)
* MongoDB Atlas (para produção) ou MongoDB local (para desenvolvimento) - É recomendado usar o MongoDB Atlas para produção, mas você pode rodar localmente para desenvolvimento.

---

### Instalação

1. Clone o repositório:

```bash
git clone git@github.com:Brendhon/bytebank-api.git
cd bytebank-api
```

2. Instale as dependências:

```bash
npm install
```

3. Configure variáveis de ambiente criando um arquivo `.env` com:

```env
MONGO_URI=mongodb://localhost:27017/bytebankdb
PORT=4000
JWT_SECRET=seu_segredo_jwt
```

---

### Modos de Execução

#### 1. Desenvolvimento com Hot Reload (Recomendado para desenvolvimento)

Este modo é ideal para desenvolvimento local, oferecendo hot reload e melhor experiência de debugging:

```bash
# Inicia o MongoDB em container e a API com hot reload
npm run dev

# Para parar o container do MongoDB quando terminar
npm run dev:stop
```

Neste modo:
- O MongoDB roda em um container Docker
- A API roda diretamente na sua máquina com hot reload
- Alterações no código são refletidas instantaneamente
- Ideal para desenvolvimento ativo

#### 2. Execução Completa via Docker

Para executar toda a aplicação em containers Docker:

```bash
# Constrói e inicia todos os containers
docker compose up

# Com rebuild (caso tenha alterações na imagem)
docker compose up --build
```

**Limitações do modo Docker completo:**
- Não possui hot reload
- Alterações no código requerem rebuild da imagem
- Cache da imagem pode causar problemas se não for feito rebuild
- Melhor para testes de produção ou CI/CD

Em ambos os casos, a API estará disponível em `http://localhost:4000/graphql`.

**Quando usar cada modo?**
- Use `npm run dev` durante o desenvolvimento ativo (coding)
- Use `docker compose up` para testar o ambiente de produção ou quando precisar da stack completa em containers

---

## 📑 Documentação da API

Utilizamos **Apollo Sandbox** para facilitar o desenvolvimento e teste.

Para documentação formal, usaremos o Apollo Sandbox e manteremos o schema GraphQL atualizado para autogeração de documentação.

---

## 🧰 Scripts disponíveis

| Script              | Descrição                                       |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Roda API em modo desenvolvimento com hot reload |
| `npm run dev:stop`  | Para o container do MongoDB em desenvolvimento  |
| `npm start`         | Roda API em modo produção                       |

---

## 👥 Autor
<img style="border-radius: 20%;" src="https://avatars1.githubusercontent.com/u/52840078?s=400&u=67bc81db89b5abf12cf592e0c610426afd3a02f4&v=4" width="120px;" alt="autor"/><br>
**Brendhon Moreira**

[![Linkedin Badge](https://img.shields.io/badge/-Brendhon-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/brendhon-moreira)](https://www.linkedin.com/in/brendhon-moreira)
[![Gmail Badge](https://img.shields.io/badge/-brendhon.e.c.m@gmail.com-c14438?style=flat-square&logo=Gmail&logoColor=white&link=mailto:brendhon.e.c.m@gmail.com)](mailto:brendhon.e.c.m@gmail.com)
---

## 📄 Licença

MIT © Brendhon Eduardo

---
