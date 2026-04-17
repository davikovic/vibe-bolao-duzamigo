vamos finalizar o projeto Bolão Duzamigo preparando-o para a produção. Siga rigorosamente estas etapas técnicas:

1. Rebranding e Proteção de Rota:

Substituição Global: Troque todas as ocorrências de vibe-bolao-duzamigo por bolao-duzamigo (títulos, cookies, metadados e nomes de pastas).

Redirect de Autenticação: No componente da Home ou Middleware, implemente uma verificação de sessão. Se o usuário não estiver autenticado, ele deve ser redirecionado para /login imediatamente, impedindo que a estrutura do dashboard apareça 'bugada' para usuários deslogados.

2. Gestão de Membros (Remoção):

Funcionalidade: Adicione a capacidade de Admins e Moderadores removerem usuários de um bolão.

UI: Inclua um botão de 'Remover' na lista de membros (no /admin para o Admin Global e no /manage para o Moderador).

3. Sistema de Sincronização Inteligente (Modal de Sync):

Integração Grátis: Implemente uma lógica de busca de jogos da Copa (via API pública gratuita ou repositório de dados abertos).

Interface de Importação: Ao clicar em 'Sincronizar' no painel Admin, abra um Modal Dark Gold organizado por Abas de Rodadas (Ex: Rodada 1, Rodada 2, Oitavas...).

Conferência: Dentro de cada aba, liste os jogos encontrados (Rodada, Time A, Time B, Data/Hora) com um status visual indicando se o jogo é 'Novo' ou se 'Já existe no banco'.

Confirmação: A importação para o banco de dados só deve ocorrer após o Admin selecionar os jogos/rodada e clicar em 'Confirmar Importação'.

4. Regras de Negócio e Validação:

Bloqueio de Negativos: No formulário de resultados, impeça a inserção de placares menores que zero (validação via Zod ou lógica de estado).

Idempotência: Garanta que o sistema não crie duplicatas de jogos ao sincronizar a mesma rodada múltiplas vezes.

5. Refino da Home do Usuário (Foco em Palpites):

Filtro de Exibição: Altere a lógica da Home para exibir APENAS jogos que ainda não aconteceram (ou que ainda permitem palpites).

Histórico: Jogos concluídos e resultados passados devem ser removidos da Home e exibidos exclusivamente na seção 'Histórico de Palpites' dentro do Perfil do usuário.

Commit: final: rebranding, member removal, round-based smart sync and home UI cleanup."