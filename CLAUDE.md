# CLAUDE.md - Regras Rígidas para Desenvolvimento

## SISTEMA: Análise de Padrões de Roleta com IA

Sistema consolidado de análise de padrões de roleta em TypeScript com arquitetura client-side unificada. Mesa visual idêntica à roleta europeia, análise instantânea, estratégias automáticas e interface responsiva.

## ESTRUTURA ATUAL DO PROJETO

```
/
├── client/src/           # Frontend React + TypeScript  
│   ├── components/       # Componentes React modulares
│   ├── hooks/           # Custom hooks reutilizáveis
│   ├── lib/             # Utilitários e lógica de negócio
│   ├── pages/           # Páginas principais da aplicação
│   └── main.tsx         # Entry point do React
├── server/              # Backend Node.js + Express
│   ├── index.ts         # Servidor principal
│   ├── routes.ts        # Rotas da API
│   ├── storage.ts       # Interface de armazenamento
│   └── ai-services.ts   # Serviços de IA externa
├── shared/              # Schemas e tipos compartilhados
└── package.json         # Dependências e scripts
```

## REGRAS RÍGIDAS - NUNCA VIOLE

### 1. LIMITE DE LINHAS POR ARQUIVO: 300 LINHAS MÁXIMO
- **JAMAIS** crie arquivos com mais de 300 linhas
- Se arquivo passar de 280 linhas, **DIVIDA IMEDIATAMENTE**
- Prefira 5 arquivos de 60 linhas do que 1 arquivo de 300 linhas

### 2. ARQUITETURA MODULAR OBRIGATÓRIA
- **UM COMPONENTE = UM ARQUIVO**
- **UMA FUNCIONALIDADE = UM MÓDULO**
- **SEM DUPLICAÇÃO DE CÓDIGO**
- **SEM LÓGICA COMPLEXA EM COMPONENTES**

### 3. NOMENCLATURA RÍGIDA
```typescript
// COMPONENTES: PascalCase
RouletteTable.tsx
PatternAnalysis.tsx

// HOOKS: camelCase com prefixo use
useAuth.ts
useWebSocket.ts

// UTILITÁRIOS: kebab-case
roulette-utils.ts
pattern-analyzer.ts

// TIPOS: PascalCase com Type/Interface
type RouletteResult
interface PatternAnalysis
```

### 4. TIPAGEM OBRIGATÓRIA
- **TODO código deve ter tipagem TypeScript explícita**
- **SEM uso de 'any' - use 'unknown' se necessário**
- **SEM tipos implícitos em funções públicas**
- **Schemas Zod para validação de dados externos**

### 5. IMPORTS E EXPORTS PADRONIZADOS
```typescript
// SEMPRE usar imports nomeados quando possível
import { Component, useState } from 'react';
import { Button } from '@/components/ui/button';

// SEMPRE exportar como default componentes principais
export default function RouletteTable() {}

// SEMPRE usar barrel exports para índices
export { RouletteTable } from './RouletteTable';
export { PatternAnalysis } from './PatternAnalysis';
```

### 6. ESTRUTURA DE COMPONENTES OBRIGATÓRIA
```typescript
// TEMPLATE OBRIGATÓRIO PARA COMPONENTES
import { useState, useEffect } from 'react';
import { type ComponentProps } from './types';

interface Props {
  // Props tipadas explicitamente
}

export default function ComponentName({ prop1, prop2 }: Props) {
  // 1. Estados locais
  // 2. Hooks customizados  
  // 3. Effects
  // 4. Handlers
  // 5. Render

  return (
    // JSX limpo e legível
  );
}
```

### 7. HOOKS PERSONALIZADOS OBRIGATÓRIOS
- **TODA lógica reutilizável vai para hooks personalizados**
- **SEM lógica de negócio diretamente nos componentes**
- **Hooks devem ter máximo 100 linhas**

### 8. API E BACKEND SIMPLIFICADO
- **Backend apenas para CRUD e WebSocket**
- **TODA análise de padrões no frontend (UnifiedPatternAnalyzer)**
- **SEM duplicação de lógica servidor/cliente**
- **APIs RESTful simples e diretas**

### 9. SISTEMA DE ARQUIVOS MODULAR
```
client/src/
├── components/
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── roulette/        # Específicos da roleta  
│   ├── analysis/        # Específicos de análise
│   └── common/          # Compartilhados
├── hooks/
│   ├── auth/            # Hooks de autenticação
│   ├── roulette/        # Hooks da roleta
│   └── common/          # Hooks genéricos
├── lib/
│   ├── analyzers/       # Analisadores de padrão
│   ├── services/        # Serviços externos
│   └── utils/           # Utilitários gerais
```

### 10. PADRÕES DE CÓDIGO PROIBIDOS

#### ❌ NUNCA FAÇA:
```typescript
// NÃO: Componente gigante com tudo misturado
function HugeComponent() {
  // 500 linhas de código...
}

// NÃO: Lógica de negócio em componente
function RouletteTable() {
  const analyzePattern = () => {
    // 50 linhas de análise complexa...
  }
}

// NÃO: Tipos any ou indefinidos
function processData(data: any) {}

// NÃO: Imports não organizados
import React from 'react';
import { Button } from './button';
import { useState } from 'react';
```

#### ✅ SEMPRE FAÇA:
```typescript
// SIM: Componente focado e limpo
function RouletteTable({ onNumberClick }: Props) {
  return <div>{/* JSX simples */}</div>;
}

// SIM: Lógica em hook personalizado
function usePatternAnalysis() {
  // Lógica isolada e testável
}

// SIM: Tipagem explícita
function processData(data: RouletteResult[]): AnalysisResult {
  // Código tipado
}
```

### 11. PERFORMANCE E OTIMIZAÇÃO
- **useMemo para cálculos pesados**
- **useCallback para handlers que passam para filhos**
- **lazy loading para componentes grandes**
- **Evitar re-renders desnecessários**

### 12. TRATAMENTO DE ERROS OBRIGATÓRIO
```typescript
// Template obrigatório para APIs
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('Erro específico:', error);
  throw new Error('Mensagem amigável');
}

// Error boundaries para componentes
<ErrorBoundary>
  <Component />
</ErrorBoundary>
```

## COMANDOS DE DESENVOLVIMENTO

```bash
# Desenvolvimento
npm run dev          # Inicia servidor dev

# Build e deploy  
npm run build        # Build produção
npm start           # Serve produção

# Verificações
npm run check       # TypeScript check
```

## STACK TECNOLÓGICO ATUAL

### Frontend Consolidado:
- **React 18** + **TypeScript 5.6**
- **Vite** (build tool)
- **Tailwind CSS** + **shadcn/ui**
- **TanStack Query v5** (estado servidor)
- **Wouter** (roteamento)
- **Framer Motion** (animações)

### Backend Simplificado:
- **Node.js** + **Express.js**
- **WebSocket** (ws) opcional
- **Storage em memória** (desenvolvimento)
- **Zod** (validação)

### Análise Client-Side:
- **UnifiedPatternAnalyzer** (análise de padrões)
- **External AI Services** (OpenAI/Claude - opcional)

## FUNCIONALIDADES IMPLEMENTADAS ✅

1. **Mesa de Roleta Visual** - Layout idêntico ao original europeu
2. **Entrada Manual** - Clique direto nos números funcionando
3. **Análise de Padrões** - UnifiedPatternAnalyzer em tempo real
4. **Estratégias Automáticas** - 7 números plenos baseados em histórico
5. **Interface Responsiva** - 3 modos: mobile, custom, desktop
6. **Sistema de Autenticação** - AuthProvider simplificado
7. **WebSocket Opcional** - Comunicação tempo real não crítica
8. **Dashboard Modular** - Componentes intercambiáveis

## PRÓXIMOS DESENVOLVIMENTOS

### Prioridade ALTA:
- Testes unitários com Jest/Vitest
- Melhorias na análise de padrões
- Otimização de performance

### Prioridade MÉDIA:
- PWA completo
- Análises IA mais avançadas  
- Sistema de notificações

### Prioridade BAIXA:
- Migração para PostgreSQL
- Deploy automatizado
- Relatórios avançados

## REGRAS DE COMMIT

```
feat: adiciona nova funcionalidade
fix: corrige bug específico
refactor: reestrutura código sem alterar comportamento
perf: melhora performance
test: adiciona ou corrige testes
docs: atualiza documentação
style: formatação e estilo
```

## DIRETRIZES FINAIS

### ⚠️ ANTES DE QUALQUER MUDANÇA:
1. **Leia o código existente completamente**
2. **Entenda a arquitetura atual**
3. **Respeite os padrões estabelecidos**
4. **Teste localmente antes de commitir**

### 🚫 JAMAIS FAÇA:
- Arquivos com mais de 300 linhas
- Duplicação de lógica entre frontend/backend
- Componentes com múltiplas responsabilidades
- Commits sem testes básicos
- Quebra de funcionalidades existentes

### ✅ SEMPRE FAÇA:
- Código modular e testável
- Tipagem TypeScript completa
- Documentação inline quando necessário  
- Seguir padrões de nomenclatura
- Manter arquitetura client-side first

---

**Esta documentação é OBRIGATÓRIA. Qualquer código que viole estas regras será rejeitado.**