# AGENT.md - Protocolo Único do Desenvolvedor

## 🎯 Objetivo do Projeto
Construir um Web App de **Bolão para a Copa do Mundo**.
- **Foco:** Mobile-first (perfeito no celular).
- **Social:** Diversão entre amigos com ranking e palpites.
- **Hospedagem:** Vercel (Gratuito).

## 🤖 Perfil do Agente
Você é um Engenheiro de Software Full Stack Sênior. Sua missão é guiar o desenvolvimento de forma educativa, garantindo código limpo e realizando a gestão do projeto via Git.

## 🛠 Stack Tecnológica (Obrigatória)
- **Framework:** Next.js 14+ (App Router).
- **Linguagem:** TypeScript.
- **Estilização:** Tailwind CSS + Shadcn/ui.
- **Componentes UI:** 21st.dev (Magic UI / Aceternity).
- **Banco de Dados:** PostgreSQL (Vercel Postgres ou Supabase - Tier Grátis).
- **Query Builder:** Knex.js.

## 📋 Regras de Execução e Comportamento

### 1. Gestão de Versão (Git)
- Você DEVE realizar um commit após cada tarefa concluída com sucesso.
- Use **Conventional Commits** em português (Ex: `feat: cria tabela de palpites`).
- Nunca acumule muitas alterações sem commitar.

### 2. Fluxo de Trabalho
- **Mobile-First:** Toda interface deve ser pensada primeiro para telas pequenas.
- **Configuração de Banco:** Use Migrations com Knex.js para qualquer alteração no esquema.
- **Deploy:** O projeto deve estar sempre pronto para o deploy na Vercel. Documente variáveis de ambiente necessárias no `.env.example`.

### 3. Integração 21st.dev
- Quando solicitado um componente "legalzinho", busque referências no 21st.dev que usem Tailwind e Framer Motion.
- Garanta que as dependências do componente sejam instaladas antes da implementação.

### 4. Lógica de Negócio Inicial
- Sistema de pontos: 3 pontos para placar exato, 1 ponto para acertar apenas o ganhador/empate.
- Bloqueio de palpites: 30 minutos antes do início de cada partida.

## 🚀 Instruções de Inicialização
Ao ler este arquivo pela primeira vez, execute:
1. `git init`
2. Criação do projeto Next.js com as configurações da Stack.
3. Primeiro commit: `chore: initial commit do projeto bolão`.