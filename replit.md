# Replit.md

## Overview

Sistema completo de análise de padrões de roleta com IA desenvolvido em TypeScript. O sistema analisa padrões de roleta em tempo real, fornece insights gerados por IA e identifica oportunidades de apostas através de reconhecimento de padrões e análise estatística. Incluí mesa de roleta europeia idêntica ao original com estratégias de vizinhos (até 21 números) e números plenos (até 7 números).

## User Preferences

Preferred communication style: Portuguese, simple and everyday language.

## Estado Atual (28 de Julho 2025)

✅ **Sistema Funcionando Completamente**
- Mesa de roleta europeia com layout original (0-36)
- Sistema de análise de padrões IA funcionando
- Estratégias de vizinhos e números plenos implementadas
- WebSocket para atualizações em tempo real
- API REST funcionando corretamente (testado)
- Dashboard interativo com painéis de análise
- **NOVO**: Sistema de preferências de apostas configurável pelo cliente

✅ **Estratégias Implementadas**
- Números Plenos: exatamente 7 números obrigatoriamente por rodada, máximo 5 tentativas
- Vizinhos: até 21 números cobertos, máximo 5 tentativas  
- Recálculo automático da estratégia quando não acerta após 5 tentativas
- Algoritmo inteligente para gerar novos números plenos baseado em números quentes/frios
- **REQUISITO CRÍTICO**: Estratégias só funcionam após carregar pelo menos 10 resultados
- Sistema avisa quando está próximo de ativar as estratégias (aos 9 resultados)

✅ **Preferências de Apostas (NOVO)**
- Números Plenos: apostas diretas (0-36) com pagamento 35:1 - ATIVO
- Vizinhos: grupos de números vizinhos na roda - ATIVO  
- Dúzias: apostas nas dúzias (1-12, 13-24, 25-36) com pagamento 2:1 - ATIVO
- Colunas: apostas nas colunas verticais com pagamento 2:1 - INATIVO
- Cores: apostas vermelho/preto com pagamento 1:1 - INATIVO
- Par/Ímpar: apostas em números pares/ímpares com pagamento 1:1 - INATIVO
- Cliente pode ativar/desativar qualquer tipo de aposta pelo painel

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with WebSocket support for real-time updates
- **Pattern Analysis**: Custom algorithms for detecting roulette patterns
- **Session Management**: In-memory storage with session tracking

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Comprehensive tables for roulette results, patterns, strategies, alerts, and sessions
- **Migrations**: Drizzle Kit for database schema management
- **Development Storage**: In-memory storage implementation for development

## Key Components

### Pattern Analysis Engine
- **Algorithm Types**: Color sequences, dozen patterns, hot numbers, parity trends
- **Real-time Detection**: Continuous pattern monitoring with probability calculations
- **Confidence Scoring**: Statistical confidence levels for pattern reliability
- **Client-side Analysis**: Supplementary pattern detection in the browser

### WebSocket Integration
- **Real-time Updates**: Live pattern notifications and result streaming
- **Connection Management**: Automatic reconnection and connection status tracking
- **Message Types**: Pattern alerts, result updates, system notifications

### Roulette Table Interface
- **Interactive Table**: Clickable European roulette layout
- **Visual Feedback**: Number highlighting and animation effects
- **Manual Input**: Direct number entry and table interaction
- **Color Coding**: Red, black, and green number classification

### Strategy Management
- **Strategy Types**: Neighbor betting and straight-up strategies
- **Attempt Tracking**: Max attempts and success rate monitoring
- **Active Management**: Enable/disable strategies dynamically
- **Performance Analytics**: Success rate and usage statistics

## Data Flow

1. **Input Collection**: Manual input or API integration for roulette results
2. **Pattern Analysis**: Server-side analysis using statistical algorithms
3. **Real-time Broadcasting**: WebSocket notifications for detected patterns
4. **Client Updates**: React Query cache invalidation and UI updates
5. **Strategy Execution**: Automatic strategy triggering based on patterns
6. **Alert Generation**: User notifications for high-confidence patterns

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **ws**: WebSocket server implementation
- **zod**: Runtime type validation

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production build bundling
- **vite**: Frontend development server and build tool
- **tailwindcss**: Utility-first CSS framework

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with auto-reload
- **Database**: Local PostgreSQL or Neon development database
- **WebSocket**: Development WebSocket server

### Production Build
- **Frontend**: Vite production build with static asset optimization
- **Backend**: esbuild bundle for Node.js deployment
- **Database**: Neon PostgreSQL serverless production database
- **Environment**: Environment variable configuration for database URL

### Replit Integration
- **Development Banner**: Replit development environment detection
- **Cartographer Plugin**: Replit-specific development tools
- **Runtime Error Overlay**: Enhanced error reporting for development

The application is designed as a comprehensive roulette analysis tool with real-time pattern detection, statistical analysis, and automated strategy recommendations. The modular architecture allows for easy extension of pattern analysis algorithms and integration with external roulette data sources.