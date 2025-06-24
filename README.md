# 🚀 Bytebank API GraphQL

[![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)](https://bytebank-api.onrender.com/graphql)

Este é um projeto de API GraphQL para o "Bytebank Pro", um sistema de backend para microfrontends. A API é construída com **Node.js**, **TypeScript**, **Apollo Server**, **Express** e **MongoDB**.

O sistema oferece funcionalidades de autenticação de usuários, incluindo registro e login com senhas criptografadas, e gerenciamento de transações financeiras. Os usuários autenticados podem criar, ler, atualizar e deletar suas próprias transações, além de visualizar um resumo com o saldo e a discriminação dos tipos de transação. A API também inclui paginação para a listagem de transações, garantindo um desempenho eficiente. A autenticação é realizada via JSON Web Tokens (JWT), e as rotas protegidas são acessíveis apenas com um token válido.

O projeto está configurado para ser executado com **Docker**, tanto para o banco de dados MongoDB quanto para a própria API, e inclui um modo de desenvolvimento com hot reload para facilitar a codificação.

---

## ✨ Funcionalidades

- **Autenticação de Usuário**: Registro e login seguros com JWT.
- **Gerenciamento de Transações**: Operações de CRUD (Criar, Ler, Atualizar, Deletar) para transações financeiras.
- **Resumo Financeiro**: Endpoint para obter o saldo atual e um resumo das transações.
- **Paginação**: Suporte para paginação na listagem de transações.
- **Segurança**: Senhas criptografadas e rotas protegidas por autenticação.
- **CORS Inteligente**: Configuração automática de CORS baseada no ambiente (desenvolvimento vs produção).

---

## 🛠️ Tecnologias

As seguintes tecnologias foram utilizadas na construção desta API:

- [**Node.js**](https://nodejs.org/)
- [**TypeScript**](https://www.typescriptlang.org/)
- [**GraphQL**](https://graphql.org/) com [**Apollo Server**](https://www.apollographql.com/docs/apollo-server/)
- [**Express.js**](https://expressjs.com/)
- [**MongoDB**](https://www.mongodb.com/) com [**Mongoose**](https://mongoosejs.com/)
- [**Docker**](https://www.docker.com/)
- [**TypeGraphQL**](https://typegraphql.com/) para a construção de schemas e resolvers
- [**JWT (JSON Web Token)**](https://jwt.io/) para autenticação
- [**Bcrypt.js**](https://github.com/kelektiv/node.bcrypt.js/) para criptografia de senhas

---

## 📂 Estrutura de Pastas

A estrutura de pastas do projeto está organizada da seguinte forma:

```
/
├── src/
│   ├── config/
│   │   └── index.ts
│   ├── middleware/
│   │   └── index.ts
│   ├── models/
│   │   └── index.ts
│   ├── resolvers/
│   │   └── index.ts
│   ├── schema/
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── index.ts
│   └── index.ts
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── .prettierignore
├── nodemon.json
├── package-lock.json
├── package.json
├── README.md
├── vitest.config.ts
└── tsconfig.json
```

---

## ⚙️ Configuração e Instalação

**Pré-requisitos**:

- Node.js (versão \>=18.0.0)
- Docker

**Passo a passo**:

1.  Clone o repositório:

    ```bash
    git clone https://github.com/Brendhon/bytebank-api.git
    ```

2.  Navegue até o diretório do projeto:

    ```bash
    cd bytebank-api
    ```

3.  Instale as dependências:

    ```bash
    npm install
    ```

4.  Crie um arquivo `.env` na raiz do projeto com base no `.env.example`. Você pode usar o seguinte comando para copiar o arquivo de exemplo:

    ```bash
    cp .env.example .env
    ```

    O arquivo `.env` deve conter as seguintes variáveis:

    ```env
    MONGO_URI=mongodb://localhost:27017/bytebankdb
    PORT=4000
    JWT_SECRET=seu_segredo_jwt
    NODE_ENV=development
    # Adicione os domínios permitidos separados por vírgula. Caso não forneça, o CORS permitirá todas as origens.
    ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
    ```

---

## 🛡️ Configuração CORS
A API implementa uma configuração de CORS (Cross-Origin Resource Sharing) que se adapta automaticamente ao ambiente de execução:

### Desenvolvimento
- **Permite todas as origens**: Durante o desenvolvimento (`NODE_ENV !== "production"`), o CORS permite requisições de qualquer origem.
- **Credentials habilitado**: Permite envio de cookies e headers de autorização.

### Produção
- **Apenas domínios permitidos**: Em produção (`NODE_ENV === "production"`), apenas os domínios listados na variável `ALLOWED_ORIGINS` são aceitos.
- **CORS aberto se não houver domínios**: Caso a variável `ALLOWED_ORIGINS` não seja fornecida, o CORS permitirá todas as origens, mesmo em produção.
- **Verificação de origem**: Cada requisição tem sua origem verificada contra a lista de domínios permitidos.
- **Requisições sem origem**: Permite requisições sem origem (útil para apps mobile e testes com curl).

### Exemplos de configuração:

**Desenvolvimento:**
```env
NODE_ENV=development
# ALLOWED_ORIGINS não é necessário em desenvolvimento
```

**Produção:**
```env
NODE_ENV=production
ALLOWED_ORIGINS=https://bytebankpro.com,https://www.bytebankpro.com,https://app.bytebankpro.com
```

---

## ▶️ Executando a Aplicação

**Modo de Desenvolvimento (com Hot Reload):**

Este modo é ideal para o desenvolvimento, pois o servidor reinicia automaticamente a cada alteração no código.

```bash
# Inicia o container do MongoDB e a API
npm run dev
```

Quando terminar de desenvolver, você pode parar o container do MongoDB com:

```bash
npm run dev:stop
```

**Modo Docker Completo:**
Este modo executa toda a aplicação em containers Docker, simulando um ambiente de produção.

```bash
# Constrói e inicia os containers
docker compose up
```

Para forçar a reconstrução das imagens, utilize:

```bash
docker compose up --build
```

A API estará disponível em `http://localhost:4000/graphql`.

---

## 🧰 Principais Scripts Disponíveis

- `npm run dev`: Inicia a API em modo de desenvolvimento com hot reload.
- `npm run dev:stop`: Para o container do MongoDB.
- `npm start`: Executa a API em modo de produção (requer compilação prévia).
- `npm run build`: Compila o código TypeScript.
- `npm run format`: Formata o código com o Prettier.
- `npm test`: Executa os testes automatizados.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE.md) para mais detalhes.

---

## 👥 Autor

<img style="border-radius: 20%;" src="https://avatars1.githubusercontent.com/u/52840078?s=400&u=67bc81db89b5abf12cf592e0c610426afd3a02f4&v=4" width="120px;" alt="autor"/><br>
**Brendhon Moreira**

[![Linkedin Badge](https://img.shields.io/badge/-Brendhon-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/brendhon-moreira)](https://www.linkedin.com/in/brendhon-moreira)
[![Gmail Badge](https://img.shields.io/badge/-brendhon.e.c.m@gmail.com-c14438?style=flat-square&logo=Gmail&logoColor=white&link=mailto:brendhon.e.c.m@gmail.com)](mailto:brendhon.e.c.m@gmail.com)
