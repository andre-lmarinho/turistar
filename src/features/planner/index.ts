// src/features/planner/index.ts

export {
  PlannerControls,
  CategoryFilterBar,
  DestinationCard,
  DestinationCardGrid,
  DestinationResultsList,
  DestinationFilterPanel,
  DestinationHeader,
  CategorySelection,
  SortableItem,
  DayColumn,
  ActivityCard,
  ActivityCardBase,
  ActivityCardEditing,
  ActivityCardEditorOverlay,
  ActivityModal,
  ActivityModalForm,
  ActivityModalHeader,
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
  useCatalog,
  useDestinationCatalog,
  useCatalogActivities,
  useDestinationAutocomplete,
  useGeoapifySearch,
  fetchAutocomplete,
  fetchCatalog,
  fetchSearch,
  PlannerProvider,
  usePlannerContext,
} from './hooks';

export type { CatalogApiResponse } from './hooks';

export {
  buildDaysFromInspirationData,
  formatDayPlan,
  buildInitialDays,
  cloneDays,
  moveActivityToDay,
  moveActivityPosition,
  normalizeAmount,
  syncDaysWithTripRange,
} from './services';
