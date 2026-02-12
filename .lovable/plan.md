
# Plano de Melhorias - Manual ETEC

Este plano cobre as 13 funcionalidades solicitadas, organizadas em 4 fases para implementacao incremental e testavel.

---

## Fase 1 - Fundacao Visual e UX Rapida

### 1.1 Animacoes mais suaves (framer-motion)
- Instalar `framer-motion`
- Criar componente `PageTransition` que envolve cada pagina com fade + slide
- Adicionar `AnimatePresence` no `AppLayout` para transicoes entre rotas
- Micro-interacoes nos cards (hover scale, stagger em listas)
- Arquivos: `src/components/PageTransition.tsx`, `src/components/layout/AppLayout.tsx`, paginas principais

### 1.2 Empty states mais ricos
- Criar componente `EmptyState` reutilizavel com ilustracoes SVG inline (leves, sem dependencia externa)
- Variantes: atividades vazias, materias vazias, calendario vazio, estudo vazio
- Substituir todos os textos "Nenhuma atividade..." por este componente
- Arquivos: `src/components/EmptyState.tsx`, paginas que exibem listas vazias

### 1.3 Tema personalizavel (cor de destaque)
- Adicionar opcao de cor de destaque nas Configuracoes (azul, verde, roxo, laranja, rosa)
- Salvar preferencia no `localStorage`
- Criar hook `useAccentColor` que aplica CSS variables dinamicamente no `:root`
- As cores de destaque alteram `--primary` e `--ring`
- Arquivos: `src/hooks/useAccentColor.ts`, `src/pages/Settings.tsx`

### 1.4 Duplicar atividades (admin)
- Adicionar botao "Duplicar" ao lado de Editar/Excluir na lista de atividades do admin
- Ao clicar, abre o dialog de criacao ja preenchido com os dados da atividade original (titulo + " (copia)", mesma descricao, mesma materia, videos/PDFs)
- Arquivos: `src/pages/AdminActivities.tsx`

---

## Fase 2 - Dashboard e Dados

### 2.1 Dashboard mais visual (graficos Recharts)
- Adicionar ao Dashboard dois graficos:
  - **Grafico de barras**: atividades concluidas por semana (ultimas 4 semanas)
  - **Grafico de pizza/donut**: distribuicao de atividades por materia
- Usar `recharts` (ja instalado) com cores das materias
- Responsivo: em mobile os graficos empilham verticalmente
- Arquivos: `src/pages/Dashboard.tsx`, `src/components/dashboard/WeeklyChart.tsx`, `src/components/dashboard/SubjectChart.tsx`

### 2.2 Sistema de notas/grades
- **Migracao de banco**: criar tabela `grades` com colunas: `id`, `user_id`, `subject_id`, `title` (ex: "P1", "P2"), `grade` (decimal), `max_grade`, `created_at`
- RLS: usuarios veem/editam apenas suas proprias notas
- Criar pagina `/grades` com formulario para registrar notas por materia
- Exibir media por materia e grafico de desempenho (linha temporal)
- Adicionar link no sidebar
- Arquivos: `src/pages/Grades.tsx`, `src/hooks/useGrades.ts`, `src/types/database.ts`, migracao SQL

### 2.3 Painel de metricas (admin)
- Criar pagina `/admin/metrics` acessivel apenas por admins
- Consultas ao banco:
  - Total de usuarios (count profiles)
  - Taxa de conclusao geral e por materia (activity_progress vs activities)
  - Atividades mais acessadas (baseado em progresso)
- Graficos com Recharts: barras de conclusao por materia, linha de atividade ao longo do tempo
- Arquivos: `src/pages/AdminMetrics.tsx`, sidebar admin, `src/App.tsx`

---

## Fase 3 - Funcionalidades Interativas

### 3.1 Onboarding guiado
- Criar componente de tour com overlay e tooltips posicionados (sem dependencia externa, implementacao leve com React portals)
- 4-5 passos: sidebar, dashboard, cronograma, atividades, estudo
- Ativar na primeira visita (flag `onboarding_completed` no localStorage)
- Botao "Pular" e "Proximo" em cada passo
- Arquivos: `src/components/Onboarding.tsx`, `src/components/layout/AppLayout.tsx`

### 3.2 Modo "foco" (Pomodoro)
- Criar pagina `/focus` com timer Pomodoro (25min estudo / 5min pausa, configuravel)
- Selecionar materia para a sessao de estudo
- Controles: iniciar, pausar, resetar, pular para pausa
- Historico de sessoes salvo no localStorage (nao precisa de banco)
- Som de notificacao ao terminar (Web Audio API)
- Arquivos: `src/pages/Focus.tsx`, sidebar, `src/App.tsx`

### 3.3 Calendario com exportacao .ics
- Adicionar botao "Exportar" na pagina do Calendario
- Gerar arquivo `.ics` com todas as atividades pendentes (titulo, data, descricao)
- Download direto pelo navegador, sem backend
- Formato compativel com Google Calendar, Apple Calendar, Outlook
- Arquivos: `src/pages/Calendar.tsx`, `src/lib/icsGenerator.ts`

---

## Fase 4 - Social e PWA

### 4.1 Comentarios nas atividades
- **Migracao de banco**: criar tabela `activity_comments` com: `id`, `activity_id`, `user_id`, `content`, `created_at`
- RLS: todos autenticados podem ler, usuarios inserem/deletam os proprios
- Na pagina de detalhe da atividade, adicionar secao de comentarios com campo de texto e lista
- Exibir nome e avatar do autor (join com profiles)
- Arquivos: `src/pages/ActivityDetail.tsx`, `src/hooks/useComments.ts`, migracao SQL

### 4.2 Compartilhamento de materiais
- **Migracao de banco**: criar tabela `shared_materials` com: `id`, `user_id`, `subject_id`, `title`, `content` (texto/markdown), `created_at`
- RLS: todos autenticados podem ler, usuarios inserem/editam/deletam os proprios
- Criar secao "Materiais dos Alunos" na pagina de detalhe da materia
- Editor simples (textarea com suporte a markdown via react-markdown ja instalado)
- Arquivos: `src/pages/SubjectDetail.tsx`, `src/hooks/useSharedMaterials.ts`, migracao SQL

### 4.3 PWA (Progressive Web App)
- Instalar `vite-plugin-pwa`
- Configurar manifest com nome "Manual ETEC", icones, cores do tema
- Configurar service worker com cache offline (paginas e assets)
- Adicionar `navigateFallbackDenylist: [/^\/~oauth/]` para nao cachear rotas de auth
- Adicionar meta tags mobile no `index.html`
- Criar pagina `/install` com instrucoes de instalacao
- Arquivos: `vite.config.ts`, `index.html`, `public/manifest.json`, icones, `src/pages/Install.tsx`

---

## Detalhes Tecnicos

### Novas tabelas no banco de dados

```text
grades
+-------------+----------+-----------+
| Coluna      | Tipo     | Obs       |
+-------------+----------+-----------+
| id          | uuid     | PK        |
| user_id     | uuid     | NOT NULL  |
| subject_id  | uuid     | NOT NULL  |
| title       | text     | NOT NULL  |
| grade       | decimal  | NOT NULL  |
| max_grade   | decimal  | default 10|
| created_at  | timestamptz          |
+-------------+----------+-----------+

activity_comments
+-------------+----------+-----------+
| Coluna      | Tipo     | Obs       |
+-------------+----------+-----------+
| id          | uuid     | PK        |
| activity_id | uuid     | NOT NULL  |
| user_id     | uuid     | NOT NULL  |
| content     | text     | NOT NULL  |
| created_at  | timestamptz          |
+-------------+----------+-----------+

shared_materials
+-------------+----------+-----------+
| Coluna      | Tipo     | Obs       |
+-------------+----------+-----------+
| id          | uuid     | PK        |
| user_id     | uuid     | NOT NULL  |
| subject_id  | uuid     | NOT NULL  |
| title       | text     | NOT NULL  |
| content     | text     | NOT NULL  |
| created_at  | timestamptz          |
+-------------+----------+-----------+
```

### Novas rotas
- `/grades` - Sistema de notas (aluno)
- `/focus` - Modo foco / Pomodoro
- `/admin/metrics` - Painel de metricas (admin)
- `/install` - Instrucoes PWA

### Dependencias a instalar
- `framer-motion` - animacoes
- `vite-plugin-pwa` - PWA

### Ordem de implementacao recomendada
Cada fase pode ser aprovada e implementada separadamente. A Fase 1 nao depende de banco de dados, entao pode ser feita imediatamente. As fases 2-4 envolvem migracoes que precisarao de aprovacao.
