// src/features/planner/index.ts

export {
  PlannerControls,
  SortableItem,
  DayColumn,
  ActivityCard,
  ActivityCardBase,
  ActivityCardEditing,
  ActivityCardEditorOverlay,
  ActivityModal,
  ActivityModalForm,
  ActivityModalHeader,
  BudgetItem,
  BudgetPanelHeader,
  CategoryProgressBar,
  ExpenseTable,
  BudgetRow,
  ActivitiesBudgetPopup,
} from './components';

export {
  useActivityCardEditor,
  useTripRange,
  useActivitiesById,
  useActivityState,
  useDnDPlanner,
  useDragState,
  usePlanner,
  usePlanTitle,
  useSelectedActivity,
  usePlanParams,
  usePlanDays,
  useDestinationAutocomplete,
  useGeoapifySearch,
  fetchSearch,
  PlannerProvider,
  usePlannerContext,
  BudgetProvider,
  useBudgetContext,
  useBudget,
  useBudgetSupabase,
} from './hooks';

export {
  buildDaysFromInspirationData,
  formatDayPlan,
  buildInitialDays,
  cloneDays,
  moveActivityToDay,
  moveActivityPosition,
  syncDaysWithTripRange,
} from './services';

export type { Entry, CategoryKey } from './types/budget';
