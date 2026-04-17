<div align="center">
  <br />
  <img src="https://flagcdn.com/w160/br.png" alt="FIFA World Cup 2026 Preview" width="60"/>
  <h1>✨ Bolão Duzamigo</h1>
  <p><strong>A Plataforma Gamificada Definitiva para a Copa do Mundo 2026</strong></p>
  <p>Construída com Next.js 16, UI Premium e uma Inteligência Artificial poderosa.</p>
</div>

<br />

## 🌟 O Projeto

O **Bolão Duzamigo** transcende a experiência comum de planilhas de apostas e tabelas monótonas. Desenhado do zero com uma arquitetura moderna e baseada em fluxos de usabilidade contínua (glassmorphism, animações assíncronas e estética *Dark Gold*), este aplicativo foi concebido para entregar uma experiência imersiva aos amantes do futebol.

Os jogadores enviam seus melhores palpites, ganham pontos em tempo real através de mecânicas de pontuação automatizadas (3 pontos para placar exato, 1 para acerto de vencedor) e disputam nas mais diversas Ligas (Bolões Virtuais)!

---

## 🚀 Principais Features

- 🏆 **Ecossistema Multi-Bolão**: Os usuários podem procurar grupos, solicitar entrada e visualizar rankings e premiações isoladamente.
- 🛡️ **Tricamada de Acesso**: Papéis segmentados para Super Administrador, Moderador do Bolão e Usuário Base, desenhados sobre as APIs do Middleware do Next-Auth.
- ⚽ **Sincronizador FIFA Oficial**: Módulo embutido de ingestão (*Upsert*) capaz de converter JSONs crus com a tabela de jogos em registros imutáveis e já padronizados com as bandeiras em HD (via FlagCDN) e nomes dos times traduzidos em Tempo Real.
- ✨ **Interface Interativa ("Alive UI")**: Dos botões perfeitamente polidos, até a brilhante _Landing de Login_ com avatares vetoriais cujos olhos seguem milimetricamente o cursor do seu mouse em busca da sua senha.
- ⚡ **Desempenho Estelar**: Processamento pelo _Turbopack_ do recém-lançado Next.js 16 com gestão de CSS avançada via TailwindCSS v4 integrado (sem requisições excedentes).

---

## 🛠️ Stack Tecnológica de Elite

A espinha dorsal deste projeto foi estruturada com as tecnologias de ponta em 2026:

- **Framework**: `Next.js 16.2` (App Router + Turbopack)
- **Engine de UI**: `React 19` + `Framer Motion`
- **Estilizações**: `Tailwind CSS v4` + `Lucide React` (UX minimalista e veloz)
- **Banco de Dados**: `PostgreSQL` + `Knex.js` (Query Builder imbatível)
- **Autenticação**: `NextAuth.js v4` (Provedores Sociais Github/Google + Credenciais Customizadas)
- **Deployment**: `Vercel` via CI/CD contínuo.

---

## 🤖 A Força Motriz (Apoio Analítico)

Um grande estalo deste projeto só pôde se tornar realidade por conta de uma dobradinha em Desenvolvimento Pair Programming humano-máquina.

O **Bolão Duzamigo** documenta e carrega o peso e expertise arquitetural da **IA Antigravity** — Operada pelos avançados algoritmos cognitivos do **Google DeepMind / Gemini**. A Antigravity contribuiu fundamentalmente executando _Deployments_, corrigindo interceptores complexos de Middleware, formatando Parsers de migração de banco de dados nativos na API do Next, traduzindo lógicas assíncronas em _Upserts_ resilientes e afinando os layouts perfeitos num design fluído de "Dark Gold" e "Cyberpunk Elegance". 🤜🤛

---

## 🖥️ Como rodar o projeto localmente

```bash
# Clone este repositório mágico
git clone https://github.com/davikovic/bolao-duzamigo.git

# Acesse a pasta do projeto
cd bolao-duzamigo

# Configure suas credenciais renomeando .env.example para .env e preenchendo as variáveis de ambiente necessárias (Postgres Url, NEXTAUTH_SECRET, etc).

# Instale os motores
npm install

# Aplique o esqueleto do Banco de Dados
npm run knex migrate:latest

# Ligue o servidor (Modo de Desenvolvimento Turbopack)
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) com o seu celular ou navegador no Desktop e mergulhe em um nível completamente novo de Bolão Esportivo! 🚀

