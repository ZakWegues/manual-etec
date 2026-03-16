

## Plano: Reorganizar navegação e melhorar Dashboard

### Problema
1. A sidebar tem muitos itens sem agrupamento claro, dificultando encontrar funcionalidades (ex: achar atividades de BD2).
2. A Dashboard mostra apenas 5 próximas atividades, sem visão completa.
3. O Assistente IA está escondido num item de menu separado, longe do uso cotidiano.

### Mudanças propostas

#### 1. Reorganizar a Sidebar (`AppSidebar.tsx`)
Nova ordem, agrupada por uso:

**Grupo "Principal":**
- Dashboard (home central)
- Matérias (onde o aluno encontra BD2 e suas atividades)
- Calendário (visão temporal)

**Grupo "Estudo":**
- Cronograma
- Estudo (vídeos/materiais)
- Modo Foco
- Notas
- Ranking

**Grupo "Outros":**
- Instalar App

Remover "Assistente IA" da sidebar (vai para a Dashboard).

#### 2. Expandir a Dashboard (`Dashboard.tsx`)
- **Seção de atividades maior**: Em vez de limitar a 5, mostrar todas as atividades pendentes com abas/filtros (Atrasadas | Em breve | Todas pendentes), usando mais espaço vertical. Incluir busca/filtro por matéria para encontrar rapidamente "BD2".
- **Atividades atrasadas integradas**: Em vez de card separado, mostrar como aba destacada na mesma seção.
- **Mini Assistente IA**: Adicionar um card compacto na Dashboard com campo de input para perguntas rápidas ao assistente, exibindo resposta inline. Botão "Abrir chat completo" leva para `/ai-assistant`.

#### 3. Layout da Dashboard
```text
┌─────────────────────────────────────────┐
│  Olá, Nome! + Stats (3 cards)           │
├────────────────────┬────────────────────┤
│                    │                    │
│  Atividades        │  Assistente IA     │
│  [Atrasadas|Breve| │  (mini chat)       │
│   Todas]           │                    │
│  Filtro por matéria│                    │
│  (lista completa)  │                    │
│                    │                    │
└────────────────────┴────────────────────┘
```

### Detalhes técnicos

**Arquivos a modificar:**
- `src/components/layout/AppSidebar.tsx` — Reordenar `mainNavItems`, criar dois grupos ("Principal" e "Estudo"), remover item "Assistente IA"
- `src/pages/Dashboard.tsx` — Substituir a seção de atividades por componente com tabs (Atrasadas/Em breve/Todas), remover limite de 5, adicionar filtro por matéria com `useSubjects()`, adicionar card de mini assistente IA com input e chamada à edge function
- Criar `src/components/dashboard/DashboardActivities.tsx` — Componente de atividades com tabs e filtro
- Criar `src/components/dashboard/MiniAIAssistant.tsx` — Chat compacto reutilizando a lógica de `AIAssistant.tsx`

