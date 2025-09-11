# Sistema de Análise de Padrões de Roleta com IA

## Overview

Sistema consolidado de análise de padrões de roleta desenvolvido em TypeScript com arquitetura client-side unificada. Oferece mesa visual idêntica à roleta europeia original, análise instantânea de padrões (cores, dúzias), geração automática de estratégias baseadas em histórico e interface responsiva com 3 modos de exibição. Arquitetura simplificada sem duplicações, focada em performance e experiência do usuário.

## Status Atual (Janeiro 2025)

**✅ FUNCIONANDO:**
- Mesa de roleta visual harmonizada com layout perfeito
- Entrada manual com clique direto nos números funcionando
- Análise instantânea de padrões (UnifiedPatternAnalyzer)
- Geração automática de estratégias (7 números plenos)
- Interface responsiva com 3 modos otimizados
- Sistema de preferências de apostas
- Estatísticas e alertas em tempo real
- Layout vertical com 3 colunas e zero ocupando largura total
- Layout horizontal com zero alinhado às 3 linhas
- Quadrados proporcionais com bordas arredondadas harmoniosas

**🔧 CONSOLIDADO:**
- WebSocket opcional (não crítico)
- Autenticação simplificada (usuário padrão)
- API servidor limpa (sem lógica duplicada)
- PostgreSQL com DatabaseStorage implementado e funcional
- Análise IA externa (via chaves API opcionais)

**📊 TESTES REALIZADOS:**
- Mesa funcional em todos os layouts (mobile, custom, desktop)
- Cliques nos números registrando corretamente (números 20, 27, 21 testados)
- APIs retornando dados válidos (304/200 status)
- Interface responsiva adaptando perfeitamente

## User Preferences

- **Comunicação**: Português, linguagem simples e cotidiana
- **Interface**: Dashboard profissional com tema escuro tipo casino
- **Funcionalidades**: Foco em estratégias automáticas e análise de padrões

## System Architecture

Sistema SaaS consolidado com arquitetura simplificada e funcional para análise de padrões de roleta.

**Arquitetura Consolidada (Janeiro 2025):**
- **Interface Unificada**: Layout harmonizado com foco mobile-first, mesa de roleta responsiva, controles otimizados para toque direto.
- **Sistema de Autenticação Simplificado**: AuthProvider com usuário padrão para desenvolvimento, FeatureGuard funcional controlando acesso por planos.
- **Análise Client-Side**: UnifiedPatternAnalyzer consolida toda análise de padrões no frontend, removendo duplicações servidor/cliente.
- **Estratégias Automáticas**: Geração client-side de estratégias de números plenos (7 números) e vizinhos baseadas em análise unificada.
- **WebSocket Opcional**: Conexão simplificada sem dependências críticas, sistema funciona offline.
- **API Servidor Limpa**: Endpoints essenciais para CRUD (resultados, padrões, estratégias, alertas) sem lógica de análise duplicada.
- **Storage em Memória**: Sistema de armazenamento em memória para desenvolvimento com interface consistente.

**Funcionalidades Reais:**
- ✅ Mesa visual de roleta europeia idêntica ao original
- ✅ Entrada manual de números com clique direto
- ✅ Análise de padrões em tempo real (cores, dúzias)
- ✅ Geração automática de estratégias baseadas em histórico
- ✅ Interface responsiva com 3 modos de exibição
- ✅ Sistema de preferências de apostas configurável
- ✅ Painéis de estatísticas e alertas funcionais

**Frontend Architecture:**
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter for lightweight client-side routing.
- **State Management**: TanStack Query v5 for server state.
- **Bundler**: Vite.
- **UI/UX**: Radix UI and shadcn/ui for accessible and consistent design, Tailwind CSS with a custom casino theme, Framer Motion for animations, and Lucide React for iconography.
- **Components**: Modular and reusable components, custom hooks for shared logic, and context providers for themes and configurations.
- **Mobile/PWA Support**: Fully responsive design with adaptive layouts, PWA-ready with service worker and manifest, mobile-optimized roulette table with vertical layout.

**Backend Consolidado:**
- **Server**: Node.js + Express.js com rotas simplificadas
- **Storage**: PostgreSQL com DatabaseStorage implementado (Neon Database)
- **WebSocket**: Servidor opcional em `/ws` para conectividade futura
- **API Endpoints**: CRUD essencial (results, patterns, strategies, alerts) sem lógica duplicada
- **AI Services**: Integração com OpenAI/Anthropic via endpoints dedicados (opcional)

**Decisões Arquiteturais Consolidadas:**
- **Client-Side First**: Toda análise e processamento de padrões acontece no frontend
- **Simplicidade**: Removidas duplicações entre servidor/cliente, lógicas conflitantes eliminadas
- **Modularidade**: Separação clara entre componentes, hooks reutilizáveis, storage abstrato
- **Performance**: Análise instantânea sem dependência de rede, interface responsiva
- **Escalabilidade**: PostgreSQL implementado com DatabaseStorage para produção
- **UX Focada**: Interface direta com cliques, feedback visual imediato, sem complexidade desnecessária

## Dependências Técnicas

**Principais Bibliotecas (Janeiro 2025):**
- **React 18 + TypeScript**: Base do frontend com tipagem forte
- **Vite**: Build tool otimizado para desenvolvimento e produção
- **Express.js**: Servidor backend minimalista
- **@radix-ui/ + shadcn/ui**: Componentes UI acessíveis e consistentes
- **Tailwind CSS**: Framework CSS utility-first com tema casino customizado
- **TanStack Query v5**: Gerenciamento de estado servidor e cache
- **Wouter**: Roteamento client-side leve
- **ws**: WebSocket para comunicação opcional tempo real
- **Zod**: Validação de schemas TypeScript-first
- **Lucide React**: Biblioteca de ícones

**Integrações Opcionais:**
- **OpenAI GPT-4o**: Análise IA externa (chave API necessária)
- **Anthropic Claude-4**: Análise IA externa alternativa (chave API necessária)
- **@neondatabase/serverless**: Driver PostgreSQL para produção futura

**Arquivos Core:**
- `UnifiedPatternAnalyzer`: Classe consolidada para análise de padrões
- `AuthProvider`: Sistema de autenticação simplificado
- `IStorage`: Interface abstrata para storage (memória/PostgreSQL)
- `RouletteTable`: Mesa visual idêntica à roleta europeia original