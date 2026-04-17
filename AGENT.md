🎯 Objetivo do Projeto
Construir uma Plataforma de Bolão Multi-Tenant para a Copa do Mundo.

Foco: Mobile-first com estética "Dark Gold" (RubinOT style).

Escala: Suporte a múltiplos grupos (bolões) independentes com isolamento total.

Hospedagem: Vercel (Gratuito).

🛠 Stack Tecnológica (Obrigatória)
Framework: Next.js 14+ (App Router).

Autenticação: NextAuth.js (Google, GitHub e Credentials com Bcrypt).

Banco de Dados: PostgreSQL (Vercel/Supabase) via Knex.js.

Estilização: Tailwind CSS + Shadcn/ui + Framer Motion.

Segurança: Middleware de proteção e Proxy de rotas baseado em Roles.

👑 Hierarquia de Permissões
Admin Global: Acesso total (Cria bolões, gerencia resultados globais, promove moderadores).

Moderador de Bolão: Gerencia apenas os membros do seu próprio bolão (Aprova/Remove).

Membro: Realiza palpites e visualiza o ranking do seu bolão ativo.

📋 Regras de Negócio e Comportamento
1. Gestão de Dados e UI
Multi-Bolão: Todas as queries de ranking e jogos devem filtrar por pool_id.

Sincronização: Os jogos são globais, mas liberados para palpites por Rodadas via interface administrativa.

Validations: Proibido placares negativos. Bloqueio de palpites 30min antes do jogo.

Avatares: Use DiceBear (seed=email) como fallback para usuários sem foto de rede social.

2. Fluxo de Trabalho
Conventional Commits: Realize um commit após cada tarefa concluída com sucesso.

Mobile-First: Priorize a usabilidade em telas pequenas (BottomNav no mobile, Sidebar no Desktop).

Isolamento de Login: A tela de login deve ser limpa, sem elementos de navegação do dashboard.

🚀 O Plano de Ação para o Novo Agente
Agora, você pode passar as seguintes instruções para o Agente na conta nova:

Analise o Projeto: "Analise todo o código atual para entender a implementação do Multi-Bolão, o middleware de segurança e o sistema de moderadores."

Leia o Protocolo: "Leia o AGENT.md atualizado para absorver as novas regras de hierarquia e stack."

Sprint Final: "Com base no código e no protocolo, execute a última sprint do nextSprint.md (Rebranding, Reset de Banco, Modal de Sync por Rodadas e Filtro de Home)."