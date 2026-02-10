

# Plano de Implementacao - 4 Funcionalidades

Este plano cobre: foto de perfil, landing page enriquecida, notificacoes push e busca global.

---

## 1. Foto de Perfil

### O que muda
- Usuarios poderao fazer upload de uma foto de perfil na pagina "Meu Perfil"
- A foto aparecera na sidebar, na pagina de perfil e em qualquer lugar que mostre o avatar

### Detalhes tecnicos
- **Banco de dados**: Adicionar coluna `avatar_url` (text, nullable) na tabela `profiles`
- **Storage**: Criar bucket `avatars` (publico) com politicas RLS para que cada usuario so possa fazer upload/atualizar sua propria foto
- **Arquivos modificados**:
  - `src/pages/Profile.tsx` - Adicionar botao de upload sobre o avatar, com preview e envio ao storage
  - `src/components/layout/AppSidebar.tsx` - Usar `AvatarImage` com a URL do avatar quando disponivel
  - `src/contexts/AuthContext.tsx` - Expor `avatar_url` do profile e adicionar funcao `updateProfile`
  - `src/types/database.ts` - Adicionar `avatar_url` ao tipo `Profile`

---

## 2. Landing Page Mais Rica

### O que muda
- Navbar fixa no topo com logo e botoes "Entrar" / "Criar Conta"
- Secao de estatisticas animadas (ex: "100+ Alunos", "50+ Atividades")
- Secao "Como Funciona" com 3 passos ilustrados
- Secao de depoimentos/testimonials com cards
- Footer expandido com links uteis
- Animacoes de scroll (fade-in ao aparecer na tela)

### Detalhes tecnicos
- **Arquivos modificados**:
  - `src/pages/Index.tsx` - Reescrever com todas as novas secoes
  - `src/index.css` - Adicionar animacoes de scroll (intersection observer via classes CSS)
- **Sem mudancas no banco de dados** - conteudo estatico

---

## 3. Notificacoes Push (In-App)

### O que muda
- Icone de sino no header do app com badge de contagem
- Dropdown com lista de notificacoes (atividades proximas do prazo, novas atividades adicionadas)
- Notificacoes geradas automaticamente com base nos prazos das atividades

### Detalhes tecnicos
- **Banco de dados**: Criar tabela `notifications` com colunas: `id`, `user_id`, `title`, `message`, `type`, `is_read`, `link`, `created_at`
- Politicas RLS: cada usuario ve/atualiza apenas suas proprias notificacoes
- Criar funcao de banco `generate_activity_notifications` que cria notificacoes para atividades com prazo em 1-3 dias (pode ser chamada via trigger ou pelo frontend)
- **Arquivos novos/modificados**:
  - `src/hooks/useNotifications.ts` - Hook para buscar, marcar como lida, contar nao-lidas
  - `src/components/NotificationBell.tsx` - Componente com Popover mostrando lista de notificacoes
  - `src/components/layout/AppLayout.tsx` - Adicionar `NotificationBell` no header ao lado do FeedbackDialog

---

## 4. Busca Global

### O que muda
- Campo de busca no header do app (com atalho Ctrl+K)
- Busca por materias, atividades e conteudos de estudo
- Resultados agrupados por categoria com links diretos

### Detalhes tecnicos
- **Arquivos novos/modificados**:
  - `src/components/GlobalSearch.tsx` - Componente usando `cmdk` (Command, ja instalado) com Dialog para busca
  - `src/components/layout/AppLayout.tsx` - Adicionar botao de busca no header que abre o dialog
  - Busca feita client-side com queries em `subjects`, `activities` e `study_videos` usando `.ilike()` ou `.textSearch()`
- **Sem mudancas no banco de dados** - usa tabelas existentes

---

## Ordem de Implementacao

1. **Foto de perfil** - Migracao de banco (avatar_url + bucket) -> UI de upload -> Exibicao no sidebar/perfil
2. **Landing page** - Puramente frontend, sem dependencias
3. **Busca global** - Puramente frontend, usa `cmdk` ja instalado
4. **Notificacoes** - Migracao de banco (tabela notifications) -> Hook + componente -> Integracao no header

---

## Resumo das Migracoes SQL

```text
Migracao 1:
- ALTER TABLE profiles ADD COLUMN avatar_url text
- Criar bucket "avatars" (publico)
- Politicas RLS no bucket

Migracao 2:
- CREATE TABLE notifications (id, user_id, title, message, type, is_read, link, created_at)
- Politicas RLS para notifications
```

