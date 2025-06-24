# Docker Hub CI/CD Setup

Este documento explica como configurar a integração CI/CD para publicar imagens Docker no Docker Hub automaticamente via GitHub Actions.

## Tags Geradas

Na branch `main`, são criadas duas tags:
- `latest`: Sempre aponta para a versão mais recente em produção
- `<versão>`: Exemplo `1.2.3`, igual ao campo `version` do `package.json`

**Exemplo:**  

Para `"version": "1.2.3"` no `package.json`:

```
brendhon/bytebank-api-graphql:latest
brendhon/bytebank-api-graphql:1.2.3
```

## Estratégias de Deploy

**Versão específica (recomendado):**
```bash
docker pull brendhon/bytebank-api-graphql:1.2.3
docker run -p 3000:3000 brendhon/bytebank-api-graphql:1.2.3
```

**Sempre a versão mais recente:**
```bash
docker pull brendhon/bytebank-api-graphql:latest
docker run -p 3000:3000 brendhon/bytebank-api-graphql:latest
```

**Docker Compose:**
```yaml
services:
  api:
    image: brendhon/bytebank-api-graphql:1.2.3
    ports:
      - "3000:3000"
```

## Pré-requisitos

1. Conta no Docker Hub
2. Repositório no GitHub
3. Token de acesso do Docker Hub

## Configuração dos Secrets no GitHub

1. No repositório, acesse **Settings > Secrets and variables > Actions**
2. Adicione:
   - `DOCKER_USERNAME`: Seu usuário Docker Hub
   - `DOCKER_TOKEN`: Token gerado no Docker Hub com permissão de leitura, escrita e deleção

## Como funciona o Workflow

- **Push na branch main:** Builda e faz push da imagem para o Docker Hub
- **Pull Request:** Apenas builda para validação (sem push)

### 📋 **Detalhamento dos Steps**

O workflow executa os seguintes passos em sequência:

#### **Step 1: Checkout repository**
- **O que faz:** Baixa o código do repositório para o runner do GitHub Actions
- **Por que:** Necessário para acessar o código fonte, Dockerfile e package.json
- **Action usado:** `actions/checkout@v4`

#### **Step 2: Extract version from package.json**
- **O que faz:** Lê a versão do `package.json` e a disponibiliza para outros steps
- **Por que:** Permite usar a versão do projeto como tag da imagem Docker
- **Comando:** `node -p "require('./package.json').version"`

#### **Step 3: Set up Docker Buildx**
- **O que faz:** Configura o Docker Buildx (builder avançado do Docker)
- **Por que:** Permite builds multi-arquitetura (AMD64 + ARM64) e cache avançado
- **Action usado:** `docker/setup-buildx-action@v3`

#### **Step 4: Log in to Docker Hub**
- **O que faz:** Autentica no Docker Hub usando secrets configurados
- **Por que:** Necessário para fazer push das imagens para o registry
- **Condicional:** Só executa se não for Pull Request
- **Action usado:** `docker/login-action@v3`

#### **Step 5: Extract metadata**
- **O que faz:** Gera automaticamente tags e labels para a imagem Docker
- **Por que:** Padroniza metadados e cria tags baseadas na versão do package.json
- **Tags geradas:** `latest` e versão (ex: `1.0.0`)
- **Action usado:** `docker/metadata-action@v5`

#### **Step 6: Build and push Docker image**
- **O que faz:** Builda a imagem Docker e faz push para o Docker Hub
- **Por que:** Cria e publica a imagem final que será usada em produção
- **Recursos:** Multi-arquitetura, cache do GitHub Actions, labels OCI
- **Action usado:** `docker/build-push-action@v5`

#### **Step 7: Generate artifact attestation**
- **O que faz:** Gera atestados de build para segurança e proveniência
- **Por que:** Prova que a imagem foi buildada pelo repositório específico
- **Benefícios:** Rastreabilidade, integridade, compliance de segurança
- **Condicional:** Só executa para pushes reais (não PRs)
- **Action usado:** `actions/attest-build-provenance@v1`

## Atualizando a Versão

1. Atualize o campo `version` no `package.json` ou use:
   ```bash
   npm version patch|minor|major
   ```
2. Faça commit e push para `main`:
   ```bash
   git push origin main --follow-tags
   ```
3. O workflow criará as tags `latest` e a versão correspondente

## Funcionalidades do Workflow

- Build multi-arquitetura (AMD64 e ARM64)
- Cache de build para acelerar execuções
- Geração automática de labels e tags
- Uso de tokens para segurança
- Build attestation para rastreabilidade
- Push condicional (testa PRs sem publicar)
- Apenas 2 tags essenciais: versão e latest

## Otimizações do Dockerfile

- Multi-stage build para imagens menores
- Executa como usuário não-root (`apiuser`)
- Instala só dependências de produção
- Health check configurado
- Otimização de camadas e ownership dos arquivos

## Testando Localmente

```bash
# Build local
npm run docker:build
# ou
docker build -t bytebank-api .

# Executar localmente
npm run docker:run
# ou
docker run -p 3000:3000 --env-file .env bytebank-api

# Testar imagem do Docker Hub
docker pull brendhon/bytebank-api-graphql:latest
docker run -p 3000:3000 brendhon/bytebank-api-graphql:latest

# Testar versão específica
docker pull brendhon/bytebank-api-graphql:1.0.0
docker run -p 3000:3000 brendhon/bytebank-api-graphql:1.0.0

# Verificar health check
docker inspect --format='{{.State.Health.Status}}' <container-id>

# Testar build TypeScript (sem Docker)
npm run build:check
```

## Segurança

- O container roda como usuário não-root (`apiuser`) para reduzir riscos e seguir boas práticas.

## Troubleshooting

### 🔧 **Problemas Comuns**

- **Erro de autenticação:** Verifique os secrets `DOCKER_USERNAME` e `DOCKER_TOKEN`
- **Build falhando:** Confirme se `npm run build` funciona localmente e dependências estão corretas
- **Imagem grande:** Revise `.dockerignore` e considere imagens base menores

### ⚠️ **Erro de Build Attestation**

Se você encontrar o erro `Unable to get ACTIONS_ID_TOKEN_REQUEST_URL` no Step 7:

**Causa:** Falta de permissões para gerar atestados de build

**Solução:** Adicione as permissões necessárias no workflow:
```yaml
permissions:
  contents: read
  packages: write
  id-token: write     # Para tokens de identidade
  attestations: write # Para criar atestados
```

**Alternativa:** Se o problema persistir, você pode remover o Step 7 completamente - ele é opcional e não afeta a funcionalidade principal do workflow.

## Monitoramento

- Acompanhe builds em **Actions** no GitHub
- Verifique imagens no Docker Hub
- Use as tags geradas nos seus deployments

