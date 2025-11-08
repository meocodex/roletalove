# 🧪 GUIA COMPLETO DE TESTES - Sistema de Trial

**Data**: 8 de novembro de 2025
**Status do Servidor**: ✅ Rodando na porta 5000
**Ambiente**: Desenvolvimento (Storage em memória)

---

## 📋 ÍNDICE

1. [Teste 1: Usuário Normal com Trial](#teste-1-usuário-normal-com-trial)
2. [Teste 2: Admin com Acesso Total](#teste-2-admin-com-acesso-total)
3. [Teste 3: Geração de Faturas](#teste-3-geração-de-faturas)
4. [Comandos Úteis](#comandos-úteis)

---

## TESTE 1: Usuário Normal com Trial

### 🎯 Objetivo
Testar o fluxo completo de um usuário que se cadastra, recebe 7 dias de trial, e depois tem acesso bloqueado.

### 📝 Passos para Testar

#### **Passo 1.1: Registrar Novo Usuário**

1. Acesse: `http://localhost:5000/register`

2. Preencha o formulário:
   ```
   Nome: Teste Trial
   Email: trial@teste.com
   Telefone: (11) 98765-4321
   Senha: senha123
   Plano: Básico
   ```

3. Clique em "Criar Conta"

4. **Resultado Esperado**:
   - Redirecionado para `/app`
   - Ver banner: "Trial Gratuito: Você tem 7 dias restantes"
   - Acesso liberado ao dashboard

#### **Passo 1.2: Verificar Status da Assinatura**

Abra o console do navegador (F12) e execute:

```javascript
// Verificar status atual
fetch('/api/subscription/check-access', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('📊 Status da Assinatura:', data);
  console.log('✅ Tem Acesso:', data.hasAccess);
  console.log('⏰ Dias Restantes:', data.daysLeft);
  console.log('🎁 Trial Ativo:', data.trialActive);
});
```

**Resultado Esperado**:
```json
{
  "hasAccess": true,
  "daysLeft": 7,
  "trialActive": true,
  "status": "trialing",
  "planType": "basico"
}
```

#### **Passo 1.3: Simular Expiração do Trial (Desenvolvimento)**

⚠️ **Apenas para testes! Em produção o trial expira naturalmente após 7 dias.**

Para simular a expiração, você precisaria:
- Mudar manualmente a data de início da assinatura no banco de dados
- OU esperar 7 dias reais
- OU usar um endpoint de teste que force a expiração

#### **Passo 1.4: Ver Tela de Bloqueio**

Após o trial expirar (simulado ou real):

1. Tente acessar `/app`
2. **Resultado Esperado**:
   - Tela com ícone de cadeado vermelho
   - Mensagem: "Acesso Bloqueado"
   - Explicação dos 3 passos (trial → fatura → bloqueio)
   - Botão "Ver Planos e Pagar"

---

## TESTE 2: Admin com Acesso Total

### 🎯 Objetivo
Verificar que administradores têm acesso ilimitado sem restrições de trial.

### 📝 Passos para Testar

#### **Passo 2.1: Fazer Login como Admin**

1. Acesse: `http://localhost:5000/login`

2. Entre com credenciais de admin:
   ```
   Email: admin@roletaia.com
   Senha: [senha do admin]
   ```

3. **Resultado Esperado**:
   - Redirecionado para `/app`
   - **SEM banner de trial**
   - Acesso total liberado

#### **Passo 2.2: Verificar Status de Admin**

No console do navegador:

```javascript
// Verificar dados do admin
const user = JSON.parse(localStorage.getItem('user'));
console.log('👤 Usuário:', user);
console.log('👑 Role:', user.userRole);
console.log('📦 Plano:', user.planType);

// Verificar acesso
fetch('/api/subscription/check-access', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
})
.then(r => r.json())
.then(data => console.log('🔓 Admin Access:', data));
```

**Resultado Esperado**:
```json
{
  "hasAccess": true,
  "daysLeft": -1,
  "trialActive": false,
  "status": "active"
}
```

#### **Passo 2.3: Testar Acesso às Estratégias**

1. No dashboard `/app`, verifique o painel de estratégias
2. **Resultado Esperado**:
   - Todas as 16 estratégias disponíveis
   - Nenhuma mostra "bloqueado" ou "upgrade necessário"
   - Admin pode ativar quantas quiser (ilimitado)

#### **Passo 2.4: Verificar Estratégias no Console**

```javascript
// Importar funções de verificação
import { hasStrategyAccess } from '@shared/strategy-permissions';

const user = JSON.parse(localStorage.getItem('user'));

// Testar acesso a estratégia premium
console.log('🎯 Acesso a ai_external_gpt:',
  hasStrategyAccess(user.planType, 'ai_external_gpt', user.userRole)
); // Deve retornar TRUE para admin

console.log('🎯 Acesso a probability_engine:',
  hasStrategyAccess(user.planType, 'probability_engine', user.userRole)
); // Deve retornar TRUE para admin
```

---

## TESTE 3: Geração de Faturas

### 🎯 Objetivo
Testar a geração automática de faturas quando trials expiram.

### 📝 Passos para Testar

#### **Passo 3.1: Preparar Cenário**

Você precisa ter:
- ✅ Usuários com trial expirado (status: "trialing" mas com mais de 7 dias)
- ✅ Estar logado como admin

#### **Passo 3.2: Executar Geração de Faturas**

No console do navegador (logado como admin):

```javascript
// Gerar faturas para trials expirados
fetch('/api/subscription/generate-invoices', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('💰 Resultado:', data);
  console.log('📄 Faturas Geradas:', data.invoices?.length || 0);
});
```

**Resultado Esperado** (se houver trials expirados):
```json
{
  "message": "3 fatura(s) gerada(s) com sucesso",
  "invoices": [
    "invoice-uuid-1",
    "invoice-uuid-2",
    "invoice-uuid-3"
  ]
}
```

**Resultado Esperado** (se não houver trials expirados):
```json
{
  "message": "0 fatura(s) gerada(s) com sucesso",
  "invoices": []
}
```

#### **Passo 3.3: Verificar Faturas Criadas**

```javascript
// Buscar faturas pendentes de um usuário específico
const userId = 'USER_ID_AQUI';

fetch(`/api/payments/user/${userId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
})
.then(r => r.json())
.then(payments => {
  console.log('💳 Pagamentos do usuário:', payments);
  const pending = payments.filter(p => p.status === 'pending');
  console.log('⏳ Faturas pendentes:', pending.length);
});
```

#### **Passo 3.4: Verificar Mudança de Status**

```javascript
// Verificar que a subscription mudou para 'unpaid'
fetch(`/api/subscriptions/user/${userId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
})
.then(r => r.json())
.then(sub => {
  console.log('📋 Subscription Status:', sub.status);
  // Deve estar "unpaid" após geração de fatura
});
```

---

## 🔧 COMANDOS ÚTEIS

### Via cURL (Terminal)

#### Verificar Acesso (requer token):
```bash
curl http://localhost:5000/api/subscription/check-access \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Gerar Faturas (apenas admin):
```bash
curl -X POST http://localhost:5000/api/subscription/check-access \
  -H "Authorization: Bearer ADMIN_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

#### Buscar Planos Disponíveis:
```bash
curl http://localhost:5000/api/plans
```

### Via Navegador

#### Verificar Dados do Usuário Logado:
```javascript
// Ver usuário atual
console.log('User:', JSON.parse(localStorage.getItem('user')));
console.log('Token:', localStorage.getItem('auth_token'));
```

#### Limpar Session (Logout completo):
```javascript
localStorage.clear();
location.reload();
```

---

## 🎨 CHECKLIST VISUAL

### ✅ Banner de Trial (Usuário Normal)
- [ ] Banner azul/roxo no topo
- [ ] Ícone de relógio
- [ ] Texto: "Trial Gratuito: Você tem X dias restantes"
- [ ] Botão "Ver Planos"

### ✅ Tela de Bloqueio (Trial Expirado)
- [ ] Ícone de cadeado vermelho grande
- [ ] Título: "Acesso Bloqueado"
- [ ] Badge com mensagem de erro
- [ ] Card "O que aconteceu?" com 3 itens
- [ ] Card "Como recuperar?" com botão verde
- [ ] Botão "Ver Planos e Pagar"
- [ ] Botão "Voltar ao Início"

### ✅ Admin (Sem Restrições)
- [ ] SEM banner de trial
- [ ] Todas estratégias desbloqueadas
- [ ] Nenhuma mensagem de upgrade
- [ ] Pode ativar ilimitadas estratégias

---

## 🐛 TROUBLESHOOTING

### Problema: "Subscription not found"
**Solução**: O usuário não tem assinatura criada. Ao se registrar, a assinatura deve ser criada automaticamente.

### Problema: Banner não aparece
**Possíveis causas**:
- Usuário é admin (não deve aparecer mesmo)
- Trial não está ativo (status diferente de "trialing")
- Componente `TrialBanner` não foi adicionado na rota

### Problema: AccessGuard não bloqueia
**Possíveis causas**:
- Usuário é admin (não bloqueia admin)
- Status ainda é "trialing" e trial está ativo
- Backend retornando `hasAccess: true` incorretamente

### Problema: Endpoint retorna 401
**Solução**: Token inválido ou expirado. Faça login novamente.

---

## 📊 LOGS ÚTEIS

O servidor mostra logs úteis:

```
✅ Database connection configured successfully
⚠️ Switching to in-memory storage for development
🔄 Initializing database...
3:29:36 AM [express] serving on port 5000
```

---

**Última Atualização**: 8 de novembro de 2025
**Autor**: Claude Code
**Status**: Servidor Rodando ✅
