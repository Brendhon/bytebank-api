# =============================================================================
# ESTÁGIO 1: BUILD - Compila a aplicação TypeScript
# =============================================================================
FROM node:22-alpine AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (para aproveitar o cache do Docker)
# Isso permite que o Docker reutilize esta camada se package.json não mudou
COPY package*.json ./

# Instala TODAS as dependências (incluindo devDependencies para build)
# --only=production=false garante que devDependencies sejam instaladas
RUN npm ci --only=production=false

# Copia todo o código fonte para o container
COPY . .

# Compila a aplicação TypeScript para JavaScript
# Este comando deve estar definido no package.json como "build": "tsc"
RUN npm run build

# =============================================================================
# ESTÁGIO 2: PRODUÇÃO - Imagem final otimizada para execução
# =============================================================================
FROM node:22-alpine AS production

# Cria um grupo e usuário não-root para executar a aplicação
# Usar usuário não-root é uma prática de segurança essencial
# - grupo 'nodejs' com ID 1001
# - usuário 'apiuser' com ID 1001 (nome mais apropriado para uma API)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apiuser -u 1001

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala APENAS as dependências de produção
# --only=production exclui devDependencies (TypeScript, testes, etc.)
# npm cache clean --force limpa o cache para reduzir o tamanho da imagem
RUN npm ci --only=production && npm cache clean --force

# Copia a aplicação compilada do estágio builder
# --from=builder especifica que vem do estágio anterior
# --chown=apiuser:nodejs define o proprietário dos arquivos
COPY --from=builder --chown=apiuser:nodejs /app/dist ./dist

# Copia outros arquivos necessários (schema.graphql, etc.)
# Exclui arquivos desnecessários através do .dockerignore
COPY --chown=apiuser:nodejs . .

# Muda para o usuário não-root antes de executar a aplicação
# Isso impede que a aplicação execute com privilégios de root
USER apiuser

# Expõe a porta 3000 (porta padrão definida no código)
# Isso é apenas documentativo, não abre a porta automaticamente
EXPOSE 3000

# Configura um health check para monitorar se o container está saudável
# Executa a cada 30s, timeout de 3s, inicia após 10s, máximo 3 tentativas
# Para uma API GraphQL, poderia ser uma query simples ao endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node --version || exit 1

# Comando padrão para executar a aplicação
# Deve corresponder ao script "start" no package.json
CMD ["npm", "run", "start:prod"]
