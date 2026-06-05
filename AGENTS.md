# Regras do Projeto: AI-First Quest Tracker

## 🎯 Idioma e Comunicação
- **Idioma Padrão:** Sempre responda e gere documentação em português (pt-BR).
- **Fidelidade > Progresso:** Siga estritamente o escopo planejado. Não tente adivinhar, simplificar ou "melhorar" regras por conta própria sem aprovação prévia[cite: 1].

## 🛠️ Stack Tecnológica (Web)
- **Backend:** Node.js, TypeScript, Fastify (rotas finas e orquestração)[cite: 1].
- **Validação de Borda:** Zod (obrigatório para validar dados de entrada no backend antes do service)[cite: 1].
- **Banco de Dados & ORM:** PostgreSQL gerenciado via Prisma ORM[cite: 1].
- **Frontend:** Next.js 15, React (focado estritamente em exibição e estado de tela, sem lógica de negócio)[cite: 1].
- **Testes:** Vitest ou Jest[cite: 1].

## 🏗️ Arquitetura e Camadas (Clean Architecture)
Mantenha a separação rígida de responsabilidades em três camadas:
1. **Camada de Visão/Rotas:** Recebe o request, valida com Zod e delega ao Service[cite: 1].
2. **Camada de Serviço (Service):** Onde mora toda a regra de negócio e tomada de decisão[cite: 1].
3. **Camada de Persistência (Repository):** Isola o acesso ao banco de dados usando Prisma[cite: 1].

## 🧪 Estratégia de Testes (TDD)
- **TDD Obrigatório:** Escreva o teste antes do código da funcionalidade (fluxo Red -> Green -> Refactor) para lógicas e serviços sensíveis[cite: 1].
- **Alvo:** O `QuestService` deve possuir cobertura total de testes unitários englobando caminhos felizes e tratamento de erros[cite: 1].

## 🌿 Git e Histórico Profissional
- **Padrão de Branch:** `feat/` ou `fix/` seguido do nome curto do recurso (ex: `feat/setup-architecture`).
- **Mensagens de Commit:** Siga estritamente o padrão *Conventional Commits* em **português (pt-BR)** (ex: `feat(api): adiciona esquema de quest via prisma`)[cite: 1].
- **Histórico Linear:** Commits devem ser atômicos (uma intenção por commit)[cite: 1]. Use rebase interativo antes de abrir qualquer Pull Request para limpar mensagens temporárias[cite: 1].

## 🤖 Fluxo de Trabalho (Plan Mode)
- **Sempre planeje antes de executar:** Entre em `Plan mode` e apresente uma especificação (Spec) detalhada das alterações antes de modificar ou criar qualquer arquivo[cite: 1]. Aguarde a aprovação humana explícita antes de codificar[cite: 1].
