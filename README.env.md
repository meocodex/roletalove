# Configuração de Variáveis de Ambiente

## Arquivo .env

O projeto requer um arquivo `.env` na raiz para configuração do ambiente de desenvolvimento.

### Criação do arquivo .env

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# Database Configuration
# Para desenvolvimento local:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/roletaia_dev

# Para Neon Database (recomendado):
# DATABASE_URL=postgresql://user:pass@ep-example-123456.us-east-2.aws.neon.tech/neondb

# JWT Configuration
JWT_SECRET=dev-secret-key-change-in-production-12345678901234567890
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=development

# API Keys (Opcionais - apenas se usar IAs externas)
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# Payment Provider (Opcional - Stripe)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

### Modo Desenvolvimento sem Banco de Dados

O sistema pode rodar em modo desenvolvimento **sem banco de dados configurado**.
Neste caso, será usado **armazenamento em memória** (in-memory storage).

**⚠️ ATENÇÃO**: Todos os dados serão perdidos quando o servidor for reiniciado!

### Banco de Dados Recomendado

Para desenvolvimento com persistência, recomendamos usar:

1. **Neon Database** (recomendado - serverless PostgreSQL)
   - Acesse: https://neon.tech
   - Crie um projeto gratuito
   - Copie a `DATABASE_URL`

2. **PostgreSQL Local**
   - Instale PostgreSQL localmente
   - Crie um database: `createdb roletaia_dev`
   - Use: `postgresql://postgres:postgres@localhost:5432/roletaia_dev`

### Executar Migrações

Depois de configurar o DATABASE_URL, execute as migrações:

```bash
npm run db:push
```

### Verificar Configuração

Para verificar se tudo está correto:

```bash
npm run dev
```

Se houver problemas, verifique os logs do servidor para mensagens de erro relacionadas ao banco de dados.

### Segurança

- **NUNCA** commite o arquivo `.env` no git
- O `.env` já está configurado no `.gitignore`
- Use valores diferentes para produção
- Mantenha o `JWT_SECRET` seguro e complexo em produção
