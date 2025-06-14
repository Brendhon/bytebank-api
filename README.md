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
* Apollo Sandbox para testes
* Jest + Supertest para testes automatizados

---

## ⚙️ Configuração do projeto

### Pré-requisitos

* Node.js (v22+ recomendado)
* Docker (opcional para rodar banco e API)
* MongoDB Atlas (para produção) ou MongoDB local (para desenvolvimento)

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
MONGO_URI_DEV=mongodb://localhost:27017/bytebank_dev
MONGO_URI_PROD=<sua-string-do-mongo-atlas>
PORT=4000
```

---

### Executando a API localmente

Para rodar em modo desenvolvimento com hot reload:

```bash
npm run dev
```

A API estará disponível em `http://localhost:4000/graphql`.

Você poderá testar suas queries pelo Apollo Sandbox acessando essa URL no navegador.

---

### Executando via Docker

1. Construa a imagem:

```bash
docker build -t bytebank-api .
```

2. Execute o container:

```bash
docker run -p 4000:4000 --env-file .env bytebank-api
```

---

## 🚀 Como usar

Com a API rodando, acesse o Apollo Sandbox em:

```
http://localhost:4000/graphql
```

Exemplo de query para testar:

```graphql
query {
  hello
}
```

---

## 📑 Documentação da API

Utilizamos **Apollo Sandbox** para facilitar o desenvolvimento e teste.

Para documentação formal, usaremos o Apollo Sandbox e manteremos o schema GraphQL atualizado para autogeração de documentação.

---

## 🧰 Scripts disponíveis

| Script        | Descrição                        |
| ------------- | -------------------------------- |
| `npm run dev` | Roda API em modo desenvolvimento |
| `npm start`   | Roda API em modo produção        |
| `npm test`    | Executa testes automatizados     |

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
