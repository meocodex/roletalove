# Sistema de Análise de Padrões de Roleta com IA

## Overview

Sistema completo e avançado de análise de padrões de roleta com inteligência artificial desenvolvido em TypeScript. O sistema oferece análise em tempo real de resultados da roleta europeia, geração automática de estratégias de apostas baseadas em IA, reconhecimento de padrões estatísticos e sistema configurável de preferências de apostas. A interface inclui mesa visual idêntica à roleta europeia original com interface simplificada focada apenas em cliques diretos.

## User Preferences

- **Comunicação**: Português, linguagem simples e cotidiana
- **Interface**: Dashboard profissional com tema escuro tipo casino
- **Funcionalidades**: Foco em estratégias automáticas e análise de padrões
- **Layout**: Preferências de Apostas e Estatísticas acessíveis via botões/modais (removidas da página principal)

## System Architecture

The system is a SaaS application built with a robust architecture for real-time roulette pattern analysis.

**DEFINITIVE SOLUTION IMPLEMENTED (Aug 2025):**
- React/Vite completely replaced with native Express interface
- Full-featured roulette system with HTML/CSS/JavaScript
- Advanced AI strategy generation with hot/cold number analysis
- ML prediction simulation with sector analysis (Voisins, Orphelins, Tiers)
- Color betting analysis (Red/Black) with statistical insights
- Even/Odd betting with probability calculations
- European roulette table with authentic red/black number coloring
- Mobile-responsive design with grid layouts
- Real-time result tracking and pattern analysis
- Professional casino-style interface with gradients and animations

**Core Features Implemented:**
- **Compact and Harmonized Interface**: Optimized layout for all screen types, including reduced headers, consistent spacing, and optimized components (betting-recommendations, ml-analysis-panel, external-ai-panel).
- **Mobile-First Design**: Fully responsive with adaptive layouts, mobile-optimized roulette table with vertical orientation (3 columns x 12 rows), touch-optimized controls with haptic feedback, and PWA support with offline capabilities.
- **SaaS Model with 3 Tiers**: Basic, Intermediate, and Complete plans with granular feature control via an `AuthProvider` and `FeatureGuard`.
- **AI-Powered Analysis**: Integration with OpenAI GPT-4o and Anthropic Claude-4 for advanced pattern detection, personalized recommendations, and confidence scoring.
- **ML Predictions**: Simplified ML predictions for top numbers and neighbors, with intuitive visual highlighting.
- **Automated Strategies**: Generation of Straight-up (7 numbers) and Neighbors strategies, intelligent recalculation after failures, and validation based on sufficient historical data. Includes combined strategies with portfolio optimization and risk/return analysis.
- **Configurable Preferences**: User-configurable betting types (Straight-up, Neighbors, Dozens, Columns, Colors, Odd/Even) with real-time synchronization.
- **Interactive Dashboard**: Advanced interactive charts (Frequency, Trends, Sectors, Sequences) and a customizable dashboard with predefined layouts (Beginner, Advanced, Analyst, Strategist).

**Frontend Architecture:**
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter for lightweight client-side routing.
- **State Management**: TanStack Query v5 for server state.
- **Bundler**: Vite.
- **UI/UX**: Radix UI and shadcn/ui for accessible and consistent design, Tailwind CSS with a custom casino theme, Framer Motion for animations, and Lucide React for iconography.
- **Components**: Modular and reusable components, custom hooks for shared logic, and context providers for themes and configurations.
- **Mobile/PWA Support**: Fully responsive design with adaptive layouts, PWA-ready with service worker and manifest, mobile-optimized roulette table with vertical layout.

**Backend Architecture:**
- **Server**: Node.js with Express.js.
- **Data Layer**: PostgreSQL (production) with Drizzle ORM for type-safe queries. In-memory storage for development. Zod for schema validation.
- **Real-time Communication**: WebSocket server for live updates.
- **Data Processing**: Pattern Analysis Engine, Strategy Generation based on AI, and Real-time Processing of roulette events.

**Key Architectural Decisions:**
- **Real-time Processing**: Implemented via WebSockets for immediate updates to the UI based on new results and analysis.
- **Modularity**: Separation of concerns with distinct frontend and backend layers, and a shared schema.
- **Scalability**: Designed with a SaaS model and a PostgreSQL backend to support future growth and user base expansion.
- **User-Centric Design**: Focus on an intuitive, compact, and customizable interface with direct interaction (click-based number entry).
- **AI Integration**: Parallel calls to external AI services (ChatGPT, Claude) to provide diverse and robust insights.

## External Dependencies

The project integrates with the following external services and libraries:

- **OpenAI GPT-4o**: Used for advanced AI analysis and pattern detection.
- **Anthropic Claude-4**: Used for advanced AI analysis and pattern detection, alongside OpenAI.
- **PostgreSQL**: The primary database for production environments, typically managed via services like Neon PostgreSQL Serverless.
- **@radix-ui/**: A set of unstyled, accessible UI components.
- **shadcn/ui**: A collection of reusable components built on Radix UI and Tailwind CSS.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **Framer Motion**: A library for production-ready animations.
- **Lucide React**: An icon library for React applications.
- **TanStack Query**: For server state management and data fetching.
- **Wouter**: A small routing library for React.
- **Vite**: A build tool that serves the development environment and bundles for production.
- **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
- **ws**: A simple to use, blazing fast and thoroughly tested WebSocket client & server for Node.js.
- **Drizzle ORM**: A modern TypeScript ORM for relational databases.
- **Zod**: A TypeScript-first schema declaration and validation library.
- **@neondatabase/serverless**: A PostgreSQL driver for serverless environments.