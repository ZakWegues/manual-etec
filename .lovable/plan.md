

## Plano: Navegação semanal no Cronograma

### O que muda
Adicionar um estado `weekOffset` (número) ao componente `SchedulePage` para controlar qual semana está sendo exibida. Incluir botões de seta (ChevronLeft/ChevronRight) e um botão "Hoje" no cabeçalho do cronograma.

### Alterações em `src/pages/Schedule.tsx`

1. **Novo estado**: `const [weekOffset, setWeekOffset] = useState(0)`

2. **Cálculo da semana dinâmico**: Substituir o cálculo fixo por:
   ```ts
   const weekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), weekOffset * 7);
   ```

3. **Botões de navegação** no cabeçalho (ao lado do título "Cronograma Semanal"):
   - Seta esquerda (`ChevronLeft`): `setWeekOffset(prev => prev - 1)`
   - Seta direita (`ChevronRight`): `setWeekOffset(prev => prev + 1)`
   - Botão "Hoje" (visível apenas quando `weekOffset !== 0`): `setWeekOffset(0)`
   - Exibir o intervalo da semana atual (ex: "17/03 - 21/03")

4. **Importações**: Adicionar `ChevronLeft`, `ChevronRight` do lucide-react e `addWeeks` ou usar `addDays` já importado.

Nenhuma alteração no backend ou em outros arquivos é necessária.

