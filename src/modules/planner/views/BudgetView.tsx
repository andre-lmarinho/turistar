"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import type { DayPlan } from "@/features/activity/types";
import { useBudgetLedger } from "@/features/budget/hooks/useBudgetLedger";
import { summarizeBudget } from "@/features/budget/lib/summarizeBudget";
import type { CategoryKey, Entry } from "@/features/budget/types";
import { CATEGORIES } from "@/features/budget/types";
import { Button } from "@/ui/components/button/Button";
import { Check, ChevronDown, CircleAlert, Pencil, Plus, Trash2, X } from "@/ui/components/icon/lucide-icons";
import { Spinner } from "@/ui/components/loading/Spinner";

const currencySymbol = "\u0024";
interface Props {
  planId: string;
  days: DayPlan[];
  initialEntries?: Entry[];
}

export function BudgetView({ planId, days, initialEntries }: Props) {
  const ledger = useBudgetLedger(planId, initialEntries);
  return (
    <BudgetScreen
      days={days}
      entries={ledger.data.entries}
      loadError={Boolean(ledger.error)}
      isFetching={ledger.isFetching}
      onRetry={() => void ledger.refetch()}
      isPending={ledger.isPending}
      onSave={ledger.saveEntry}
      onDelete={ledger.removeEntry}
    />
  );
}

type ExpenseInput = Omit<Entry, "id"> & { id?: string };

type BudgetScreenProps = {
  days: DayPlan[];
  entries: Entry[];
  loadError: boolean;
  isFetching: boolean;
  onRetry: () => void;
  isPending: boolean;
  onSave: (entry: ExpenseInput) => Promise<boolean>;
  onDelete: (entryId: string) => Promise<void>;
};

export function BudgetScreen({
  days,
  entries,
  loadError,
  isFetching,
  onRetry,
  isPending,
  onSave,
  onDelete,
}: BudgetScreenProps) {
  const t = useTranslations();
  const { categoryTotals, totalSpent } = summarizeBudget(days, entries);

  return (
    <div className="bg-folio-paper text-folio-ink flex h-full w-full flex-col gap-5 overflow-y-auto border border-folio-line p-3 [scrollbar-color:var(--folio-line)_transparent] scrollbar-thin [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-folio-line [&::-webkit-scrollbar-track]:bg-transparent md:p-4">
      {loadError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 border border-folio-error-border bg-folio-error/5 px-4 py-3 max-sm:grid max-sm:grid-cols-[auto_minmax(0,1fr)] max-sm:items-start max-sm:gap-x-2">
          <CircleAlert className="text-destructive-text size-5 shrink-0" aria-hidden="true" />
          <p className="text-destructive-text min-w-0 text-sm">{t("budgetRefreshFailed")}</p>
          <Button
            variant="ghost"
            disabled={isFetching}
            aria-busy={isFetching}
            onClick={onRetry}
            className="ml-auto gap-2 text-folio-ink hover:bg-folio-highlight focus-visible:ring-folio-coral max-sm:col-start-2 max-sm:ml-0 max-sm:min-h-11 max-sm:justify-self-start">
            {isFetching ? <Spinner className="size-4" /> : null}
            {t("retry")}
          </Button>
        </div>
      ) : null}
      <div className="grid min-w-0 grid-cols-1 items-start gap-5">
        <Summary totalSpent={totalSpent} />
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <CategoryBreakdown categoryTotals={categoryTotals} />
          <ExpenseTable entries={entries} onSave={onSave} onDelete={onDelete} disabled={isPending} />
        </div>
      </div>
    </div>
  );
}

function AmountDisplay({
  value,
  compact = false,
  ariaLabel = "Amount",
}: {
  value: number;
  compact?: boolean;
  ariaLabel?: string;
}) {
  const formattedValue = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const accessibleLabel = (ariaLabel || "Amount").concat(": ", currencySymbol, formattedValue);

  return (
    <span
      role="img"
      aria-label={accessibleLabel}
      className={
        compact
          ? "inline-flex items-baseline gap-1 text-base font-semibold tracking-[-0.02em] tabular-nums"
          : "inline-flex items-baseline gap-1 text-4xl font-semibold tracking-[-0.04em] tabular-nums max-sm:text-3xl"
      }>
      <span
        className={
          compact
            ? "text-current text-xs font-medium opacity-65"
            : "text-current text-base font-medium opacity-65"
        }>
        {currencySymbol}
      </span>
      <span>{formattedValue}</span>
    </span>
  );
}

function CategoryBreakdown({ categoryTotals }: { categoryTotals: Record<CategoryKey, number> }) {
  const t = useTranslations();
  const maxCategoryValue = Math.max(...Object.values(categoryTotals), 0);

  return (
    <section
      aria-labelledby="budget-categories-heading"
      className="bg-folio-white @container h-fit border border-folio-line p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="budget-categories-heading" className="font-[Alegreya,Georgia,serif] text-xl font-semibold">
          {t("categories")}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-x-4 @lg:grid-cols-2 @2xl:grid-cols-3">
        {CATEGORIES.map((category) => {
          const value = categoryTotals[category.key] || 0;
          const percent = maxCategoryValue > 0 ? Math.min(100, (value / maxCategoryValue) * 100) : 0;
          const { icon: Icon } = category;
          const label = t(category.translationKey);

          return (
            <div key={category.key} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Icon size={13} aria-hidden="true" className="text-folio-ink-soft shrink-0" />
                  <span className="min-w-0 truncate whitespace-nowrap text-sm leading-tight">{label}</span>
                </div>
                <span className="text-folio-ink-soft shrink-0 text-xs font-medium tabular-nums">
                  ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(percent)}
                aria-label={`${label} ${t("usage")} ${Math.round(percent)}%`}
                className="bg-folio-highlight mt-2 h-1">
                <div className="bg-folio-coral h-full" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Summary({ totalSpent }: { totalSpent: number }) {
  const t = useTranslations();
  return (
    <section
      aria-labelledby="budget-total-heading"
      className="bg-folio-ink text-folio-white grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border border-folio-ink px-5 py-5 md:px-7">
      <div className="min-w-0">
        <h2 id="budget-total-heading" className="font-[Alegreya,Georgia,serif] text-xl font-semibold">
          {t("totalSpent")}
        </h2>
        <p className="text-folio-white/80 mt-0.5 text-sm max-sm:max-w-28 max-sm:text-xs">
          {t("allRecordedExpenses")}
        </p>
      </div>
      <div className="text-folio-citron text-right">
        <AmountDisplay value={totalSpent} ariaLabel={t("totalSpent")} />
      </div>
    </section>
  );
}

type ExpenseDraft = Omit<ExpenseInput, "amount"> & { amount: string };
type ValidationField = "description" | "amount";
const EMPTY_DRAFT: ExpenseDraft = { description: "", category: "transport", amount: "" };

function ExpenseEditor({
  entry,
  onSave,
  onCancel,
  onValidationChange,
  onSaveErrorChange,
  disabled,
}: {
  entry?: Entry;
  onSave: (entry: ExpenseInput) => Promise<boolean>;
  onCancel?: () => void;
  onValidationChange: (id: string, errors: ValidationField[]) => void;
  onSaveErrorChange: (id: string, failed: boolean) => void;
  disabled: boolean;
}) {
  const t = useTranslations();
  const [draft, setDraft] = useState<ExpenseDraft>(() =>
    entry ? { ...entry, amount: String(entry.amount) } : EMPTY_DRAFT
  );
  const [submitting, setSubmitting] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const submitPending = useRef(false);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const id = entry?.id ?? "new-row";
  const amount = Number(draft.amount);
  const getValidationErrors = (value: ExpenseDraft) => {
    const errors: ValidationField[] = [];
    if (!value.description.trim()) errors.push("description");
    const parsedAmount = Number(value.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) errors.push("amount");
    return errors;
  };
  const updateDraft = (next: ExpenseDraft) => {
    setDraft(next);
    if (showErrors) onValidationChange(id, getValidationErrors(next));
  };
  const errors = getValidationErrors(draft);
  const save = async () => {
    if (submitPending.current || disabled) return;
    setSaveFailed(false);
    onSaveErrorChange(id, false);
    if (errors.length > 0) {
      setShowErrors(true);
      onValidationChange(id, errors);
      if (!draft.description.trim()) descriptionRef.current?.focus();
      else amountRef.current?.focus();
      return;
    }
    submitPending.current = true;
    setSubmitting(true);
    setShowErrors(false);
    try {
      if (await onSave({ ...draft, description: draft.description.trim(), amount })) {
        onValidationChange(id, []);
        if (entry) onCancel?.();
        else setDraft({ ...EMPTY_DRAFT, category: draft.category });
      } else {
        setSaveFailed(true);
        onSaveErrorChange(id, true);
      }
    } catch {
      setSaveFailed(true);
      onSaveErrorChange(id, true);
    } finally {
      setSubmitting(false);
      submitPending.current = false;
    }
  };
  return (
    <tr
      className={`h-12 transition-colors duration-200 ease-out motion-reduce:transition-none max-sm:grid max-sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] max-sm:gap-3 max-sm:border max-sm:border-folio-line max-sm:bg-folio-paper/60 max-sm:p-3 max-sm:h-auto sm:table-row ${entry ? "bg-folio-highlight" : ""}`}
      onKeyDown={(event) => {
        if (
          event.key !== "Enter" ||
          event.nativeEvent.isComposing ||
          !(event.target instanceof HTMLInputElement)
        )
          return;
        event.preventDefault();
        void save();
      }}>
      <td className="p-2 align-middle max-sm:block max-sm:w-full max-sm:col-span-2 max-sm:row-start-1 max-sm:p-0">
        <input
          ref={descriptionRef}
          // biome-ignore lint/a11y/noAutofocus: editing replaces the focused Edit button with this input.
          autoFocus={Boolean(entry)}
          id={`description-${id}`}
          name="description"
          aria-label={t("descriptionLabel")}
          aria-invalid={(showErrors && errors.includes("description")) || undefined}
          aria-describedby={
            [
              showErrors && errors.includes("description") ? `expense-validation-${id}-description` : null,
              saveFailed ? `expense-validation-${id}-save` : null,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
          value={draft.description}
          onChange={(event) => updateDraft({ ...draft, description: event.target.value })}
          placeholder={t("descriptionLabel")}
          autoComplete="off"
          readOnly={disabled || submitting}
          className={`h-9 w-full border px-2 py-0 text-sm leading-normal outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-folio-input-hover focus:ring-2 focus:ring-folio-coral motion-reduce:transition-none max-sm:h-11 ${showErrors && errors.includes("description") ? "border-folio-error-border bg-folio-error/5" : "border-folio-input bg-folio-white"}`}
        />
      </td>
      <td className="p-2 align-middle max-sm:block max-sm:w-full max-sm:col-span-1 max-sm:row-start-2 max-sm:p-0">
        <div className="relative">
          <select
            id={`category-${id}`}
            aria-label={t("categoryLabel")}
            value={draft.category}
            disabled={disabled || submitting}
            onChange={(event) => {
              const category = CATEGORIES.find(({ key }) => key === event.target.value);
              if (category) setDraft({ ...draft, category: category.key });
            }}
            className={`h-9 w-full appearance-none border border-folio-input bg-folio-white py-0 pr-8 pl-2 text-sm leading-normal outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-folio-input-hover focus:ring-2 focus:ring-folio-coral motion-reduce:transition-none max-sm:h-11 max-sm:pr-6 ${entry ? "bg-folio-white" : ""}`}>
            {CATEGORIES.map(({ key, translationKey }) => (
              <option key={key} value={key}>
                {t(translationKey)}
              </option>
            ))}
          </select>
          <ChevronDown
            className="text-folio-ink-soft pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
        </div>
      </td>
      <td className="px-2 py-1 text-right align-middle max-sm:block max-sm:w-full max-sm:col-span-1 max-sm:row-start-2 max-sm:p-0">
        <div className="relative">
          <span className="text-folio-ink-soft pointer-events-none absolute inset-y-0 left-2 flex items-center">
            {currencySymbol}
          </span>
          <input
            id={`amount-${id}`}
            ref={amountRef}
            aria-label={t("amountLabel")}
            aria-invalid={(showErrors && errors.includes("amount")) || undefined}
            aria-describedby={
              [
                showErrors && errors.includes("amount") ? `expense-validation-${id}-amount` : null,
                saveFailed ? `expense-validation-${id}-save` : null,
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
            value={draft.amount}
            readOnly={disabled || submitting}
            onChange={(event) => updateDraft({ ...draft, amount: event.target.value })}
            type="text"
            inputMode="decimal"
            placeholder={t("amountLabel")}
            autoComplete="off"
            className={`h-9 w-full border pr-2 pl-7 text-right text-sm font-semibold tabular-nums outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out focus:ring-2 focus:ring-folio-coral focus:ring-offset-1 motion-reduce:transition-none max-sm:h-11 max-sm:text-xs ${showErrors && errors.includes("amount") ? "border-folio-error-border bg-folio-error/5" : "border-folio-input bg-folio-white"}`}
          />
        </div>
      </td>
      <td className="px-2 py-1 text-right align-middle max-sm:block max-sm:w-full max-sm:col-span-2 max-sm:row-start-3 max-sm:border-t max-sm:border-folio-line max-sm:p-0 max-sm:pt-3">
        <div className="flex justify-end gap-2 max-sm:min-h-11 max-sm:items-end">
          <button
            type="button"
            onClick={() => void save()}
            aria-label={entry ? t("saveEntry") : t("addExpense")}
            aria-busy={submitting}
            aria-disabled={disabled || submitting}
            className="border-folio-line bg-folio-white hover:bg-folio-highlight active:bg-folio-highlight inline-flex size-8 cursor-pointer items-center justify-center border transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-folio-coral motion-reduce:transition-none aria-disabled:opacity-50 max-sm:size-11">
            {submitting ? (
              <Spinner className="size-4" />
            ) : entry ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label={t("cancelEdit")}
              disabled={disabled || submitting}
              className="border-folio-line bg-folio-white hover:bg-folio-highlight active:bg-folio-highlight inline-flex size-8 cursor-pointer items-center justify-center border transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-folio-coral motion-reduce:transition-none max-sm:size-11">
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function ExpenseTable({
  entries,
  onSave,
  onDelete,
  disabled,
}: {
  entries: Entry[];
  onSave: (entry: ExpenseInput) => Promise<boolean>;
  onDelete: (entryId: string) => Promise<void>;
  disabled: boolean;
}) {
  const t = useTranslations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);
  const [deleteErrorId, setDeleteErrorId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, ValidationField[]>>({});
  const [saveErrorIds, setSaveErrorIds] = useState<string[]>([]);
  const updateSaveError = (id: string, failed: boolean) => {
    setSaveErrorIds((current) =>
      failed ? (current.includes(id) ? current : [...current, id]) : current.filter((value) => value !== id)
    );
  };
  const updateValidationErrors = (id: string, errors: ValidationField[]) => {
    setValidationErrors((current) => {
      if (errors.length === 0) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: errors };
    });
  };
  const confirmDelete = async (entryId: string) => {
    setDeletePendingId(entryId);
    setDeleteErrorId(null);
    try {
      await onDelete(entryId);
      setDeletingEntryId(null);
    } catch {
      setDeleteErrorId(entryId);
    } finally {
      setDeletePendingId(null);
    }
  };
  const renderRow = (entry: Entry) => {
    if (editingId === entry.id)
      return (
        <ExpenseEditor
          key={entry.id}
          entry={entry}
          onSave={onSave}
          onCancel={() => {
            updateValidationErrors(entry.id, []);
            updateSaveError(entry.id, false);
            setEditingId(null);
          }}
          onValidationChange={updateValidationErrors}
          onSaveErrorChange={updateSaveError}
          disabled={disabled}
        />
      );
    if (deletingEntryId === entry.id) {
      const isDeleting = deletePendingId === entry.id;
      const hasDeleteError = deleteErrorId === entry.id;
      return (
        <tr
          key={entry.id}
          className="h-12 bg-folio-error/5 max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:gap-x-3 max-sm:gap-y-2 max-sm:border max-sm:border-folio-error-border max-sm:p-3 max-sm:h-auto sm:table-row">
          <th
            scope="row"
            className="p-2 text-left align-middle font-medium leading-normal max-sm:block max-sm:w-full max-sm:col-span-2 max-sm:row-start-1 max-sm:min-w-0 max-sm:p-0">
            {hasDeleteError ? (
              <p role="alert" className="text-destructive-text text-xs font-normal">
                <span className="text-folio-ink font-medium">{entry.description}</span>
                <span> — {t("budgetDeleteFailed")}</span>
              </p>
            ) : (
              t("deleteExpenseConfirm", { description: entry.description })
            )}
          </th>
          <td className="p-2 align-middle leading-normal max-sm:block max-sm:w-full max-sm:col-start-1 max-sm:row-start-2 max-sm:p-0 max-sm:text-xs max-sm:text-folio-ink-soft">
            {t(CATEGORIES.find(({ key }) => key === entry.category)?.translationKey ?? "categories")}
          </td>
          <td className="p-2 text-right align-middle max-sm:block max-sm:w-full max-sm:col-start-2 max-sm:row-start-2 max-sm:p-0">
            <AmountDisplay value={entry.amount} compact />
          </td>
          <td className="p-2 text-right align-middle max-sm:block max-sm:w-full max-sm:col-span-2 max-sm:row-start-3 max-sm:border-t max-sm:border-folio-error-border/30 max-sm:p-0 max-sm:pt-3">
            <div className="flex justify-end gap-2 max-sm:min-h-11 max-sm:items-end">
              <button
                type="button"
                onClick={() => void confirmDelete(entry.id)}
                aria-busy={isDeleting}
                disabled={disabled || isDeleting}
                className="inline-flex min-h-8 items-center justify-center gap-1 border border-folio-error-border bg-folio-error px-2 text-xs font-medium text-white transition-colors hover:bg-folio-error-border focus-visible:ring-2 focus-visible:ring-folio-coral disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none max-sm:min-h-11 max-sm:min-w-11">
                {isDeleting ? <Spinner className="size-3.5" /> : null}
                {isDeleting ? t("working") : hasDeleteError ? t("retry") : t("deleteAction")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeletingEntryId(null);
                  setDeleteErrorId(null);
                }}
                disabled={isDeleting}
                className="inline-flex min-h-8 items-center justify-center border border-folio-line bg-folio-white px-2 text-xs transition-colors hover:bg-folio-highlight focus-visible:ring-2 focus-visible:ring-folio-coral disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none max-sm:min-h-11 max-sm:min-w-11">
                {t("cancel")}
              </button>
            </div>
          </td>
        </tr>
      );
    }
    return (
      <tr
        key={entry.id}
        className="h-12 transition-colors duration-200 ease-out motion-reduce:transition-none hover:bg-folio-highlight/50 max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:gap-x-3 max-sm:gap-y-2 max-sm:border max-sm:border-folio-line max-sm:bg-folio-paper/60 max-sm:p-3 max-sm:h-auto sm:table-row">
        <th
          scope="row"
          className="p-2 text-left align-middle font-medium leading-normal max-sm:block max-sm:w-full max-sm:col-start-1 max-sm:row-start-1 max-sm:min-w-0 max-sm:wrap-break-word max-sm:p-0">
          {entry.description}
        </th>
        <td className="p-2 align-middle leading-normal max-sm:block max-sm:w-full max-sm:col-start-1 max-sm:row-start-2 max-sm:p-0 max-sm:text-xs max-sm:text-folio-ink-soft">
          {t(CATEGORIES.find(({ key }) => key === entry.category)?.translationKey ?? "categories")}
        </td>
        <td className="p-2 text-right align-middle max-sm:block max-sm:w-full max-sm:col-start-2 max-sm:row-start-1 max-sm:p-0">
          <AmountDisplay value={entry.amount} compact />
        </td>
        <td className="p-2 text-right align-middle max-sm:block max-sm:w-full max-sm:col-start-2 max-sm:row-start-2 max-sm:p-0">
          <div className="flex justify-end gap-2 max-sm:min-h-11 max-sm:items-end">
            <button
              type="button"
              onClick={() => setEditingId(entry.id)}
              aria-label={t("editEntry")}
              disabled={disabled}
              className="border-folio-line bg-folio-white hover:bg-folio-highlight active:bg-folio-highlight inline-flex size-8 cursor-pointer items-center justify-center border transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-folio-coral motion-reduce:transition-none max-sm:size-11">
              <Pencil className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setDeletingEntryId(entry.id);
                setDeleteErrorId(null);
              }}
              aria-label={t("deleteEntry")}
              disabled={disabled}
              className="border-folio-line bg-folio-white hover:bg-folio-highlight active:bg-folio-highlight inline-flex size-8 cursor-pointer items-center justify-center border transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-folio-coral motion-reduce:transition-none max-sm:size-11">
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <section
      className="bg-folio-white flex min-w-0 flex-col border border-folio-line p-4 max-sm:p-3"
      aria-labelledby="expenses-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="expenses-heading" className="font-[Alegreya,Georgia,serif] text-xl font-semibold">
          {t("expenses")}
        </h2>
      </div>
      <section
        className="overflow-x-auto overscroll-x-contain focus-visible:ring-2 focus-visible:ring-folio-coral max-sm:overflow-visible"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: allows keyboard users to scroll the expense table horizontally.
        tabIndex={0}
        aria-label={t("expenseTableCaption")}>
        <table
          aria-labelledby="expense-table-caption"
          className="w-full min-w-xl border-collapse text-sm max-sm:block max-sm:min-w-0">
          <caption id="expense-table-caption" className="sr-only">
            {t("expenseTableCaption")}
          </caption>
          <thead className="text-folio-ink-soft text-xs uppercase tracking-wide max-sm:sr-only">
            <tr className="border-b border-folio-line bg-folio-paper">
              <th scope="col" className="p-2 text-left font-normal">
                {t("descriptionLabel")}
              </th>
              <th scope="col" className="p-2 text-left font-normal">
                {t("categoryLabel")}
              </th>
              <th scope="col" className="w-32 p-2 text-right font-normal">
                {t("amountLabel")}
              </th>
              <th scope="col" className="p-2 text-right font-normal">
                {t("actionsLabel")}
              </th>
            </tr>
          </thead>
          <tbody className="[&>tr]:border-b [&>tr]:border-folio-line max-sm:grid max-sm:gap-2">
            {entries.map(renderRow)}
            <ExpenseEditor
              onSave={onSave}
              onValidationChange={updateValidationErrors}
              onSaveErrorChange={updateSaveError}
              disabled={disabled}
            />
          </tbody>
        </table>
      </section>
      {Object.entries(validationErrors).length > 0 || saveErrorIds.length > 0 ? (
        <ul
          role="alert"
          className="mt-3 flex flex-col gap-2 border border-folio-error-border/50 bg-folio-error/5 px-3 py-3 text-xs leading-5 text-destructive-text">
          {Object.entries(validationErrors).map(([id, errors]) =>
            errors.map((field) => (
              <li
                key={`${id}-${field}`}
                id={`expense-validation-${id}-${field}`}
                className="flex items-start gap-2">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  {field === "description" ? t("expenseDescriptionRequired") : t("expenseAmountInvalid")}
                </span>
              </li>
            ))
          )}
          {saveErrorIds.map((id) => (
            <li key={`${id}-save`} id={`expense-validation-${id}-save`} className="flex items-start gap-2">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{t("budgetSaveFailed")}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
