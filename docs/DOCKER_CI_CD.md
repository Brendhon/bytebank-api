# Docker Hub CI/CD Setup

Este documento explica como configurar a integração contínua para automatizar o build e push da imagem Docker para o Docker Hub.

## Pré-requisitos

1. Conta no Docker Hub
2. Repositório no GitHub
3. Token de acesso do Docker Hub

## Configuração dos Secrets no GitHub

Para que o GitHub Actions funcione corretamente, você precisa configurar os seguintes secrets no seu repositório:

### 1. Acessar as configurações do repositório
- Vá para o seu repositório no GitHub
- Clique em **Settings** (Configurações)
- No menu lateral, clique em **Secrets and variables** > **Actions**

### 2. Adicionar os secrets necessários

#### DOCKER_USERNAME
- Clique em **New repository secret**
- Nome: `DOCKER_USERNAME`
- Valor: Seu nome de usuário do Docker Hub

#### DOCKER_TOKEN
- No Docker Hub, vá em **Account Settings** > **Security** > **New Access Token**
- Crie um token com permissões de **Read, Write, Delete**
- Copie o token gerado
- No GitHub, clique em **New repository secret**
- Nome: `DOCKER_TOKEN`
- Valor: O token gerado do Docker Hub

## Como funciona o Workflow

O workflow será executado automaticamente quando:

1. **Push para a branch main**: Builda e faz push da imagem para o Docker Hub
2. **Pull Request**: Apenas builda a imagem para validação (sem push)

## Tags da Imagem

O workflow gera automaticamente as seguintes tags:

- `latest`: Para commits na branch main
- `main-<sha>`: Para commits específicos na main
- `pr-<numero>`: Para pull requests

## Recursos do Workflow

### ✅ Funcionalidades Implementadas

- **Multi-architecture build**: Suporte para AMD64 e ARM64
- **Cache inteligente**: Usa GitHub Actions cache para acelerar builds
- **Metadata extraction**: Gera labels e tags automaticamente
- **Security**: Usa tokens em vez de senhas
- **Build attestation**: Gera atestados de build para segurança
- **Conditional push**: Só faz push em merges, não em PRs

### 🐳 Otimizações do Dockerfile

- **Multi-stage build**: Reduz o tamanho final da imagem separando build e runtime
- **Non-root user**: Executa com usuário não-root (`apiuser`) para segurança
- **Production dependencies**: Instala apenas dependências de produção na imagem final
- **Health check**: Verifica se o container está saudável
- **Layer optimization**: Organiza comandos para melhor aproveitamento do cache do Docker
- **File ownership**: Define proprietário correto dos arquivos para o usuário não-root

## Testando localmente

```bash
# Build da imagem
docker build -t bytebank-api .

# Executar o container
docker run -p 3000:3000 bytebank-api

# Verificar health check
docker inspect --format='{{.State.Health.Status}}' <container-id>
```

## Configuração de Segurança

### 🔒 Usuário Não-Root

O Dockerfile foi configurado para executar a aplicação com um usuário não-root chamado `apiuser`. Isso é uma prática de segurança essencial porque:

1. **Princípio do menor privilégio**: A aplicação executa apenas com as permissões necessárias
2. **Redução de superfície de ataque**: Mesmo se a aplicação for comprometida, o atacante não terá privilégios de root
3. **Conformidade com padrões**: Segue as melhores práticas de segurança em containers

**Por que `apiuser` e não `nextjs`?**
- O nome `nextjs` foi usado por engano na versão inicial (era um template de Next.js)
- Para uma API GraphQL, `apiuser` é mais semântico e apropriado
- O nome do usuário não afeta a funcionalidade, apenas a clareza do código

## Troubleshooting

### Erro de autenticação no Docker Hub
- Verifique se os secrets `DOCKER_USERNAME` e `DOCKER_TOKEN` estão configurados corretamente
- Certifique-se de que o token tem as permissões necessárias

### Build falhando
- Verifique se o comando `npm run build` funciona localmente
- Confirme se todas as dependências estão listadas no `package.json`

### Imagem muito grande
- Revise o `.dockerignore` para excluir arquivos desnecessários
- Considere usar uma imagem base menor se possível

## Monitoramento

Após o setup, você pode:

1. Monitorar os builds na aba **Actions** do GitHub
2. Verificar as imagens no Docker Hub
3. Usar as tags geradas em seus deployments

## Próximos Passos

Considere implementar:

- **Vulnerability scanning**: Adicionar scan de segurança nas imagens
- **Notification**: Notificações no Slack/Discord para builds
- **Deployment**: Automatizar deploy em staging/production
- **Testing**: Executar testes antes do build
