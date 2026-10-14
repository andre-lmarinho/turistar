"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import type { DayPlan } from "@/features/activity/types";
import type { BudgetQueryResult, CategoryKey, Entry } from "@/features/budget/types";
import { CATEGORIES, CHART_COLORS } from "@/features/budget/types";
import { trpc } from "@/trpc/react";
import { Button } from "@/ui/components/button/Button";
import { ConfirmationDialog } from "@/ui/components/dialog/ConfirmationDialog";
import { Check, DollarSign, Pencil, Plus, Trash2, X } from "@/ui/components/icon";
import { Spinner } from "@/ui/components/loading/Spinner";

const CATEGORY_TRANSLATION_KEYS = {
  transport: "categoryTransport",
  lodging: "categoryLodging",
  food: "categoryFood",
  activities: "categoryActivities",
  shopping: "categoryShopping",
  documents: "categoryDocuments",
} as const;

const currencySymbol = "\u0024";
const EMPTY_ENTRIES: Entry[] = [];
const inputClasses =
  "h-11 w-full rounded-xl border border-input bg-background px-3 pl-8 text-right text-base font-semibold tabular-nums outline-none transition-shadow focus:ring-2 focus:ring-ring focus:ring-offset-1";
interface Props {
  planId: string;
  days: DayPlan[];
  initialEntries?: Entry[];
}

export function BudgetView({ planId, days, initialEntries }: Props) {
  const t = useTranslations();
  const activitiesTotal = days.reduce(
    (sum, day: DayPlan) =>
      sum + day.activities.reduce((total, activity) => total + (activity.budget ?? 0), 0),
    0
  );
  const [persistError, setPersistError] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const writePending = useRef(false);
  const utils = trpc.useUtils();
  const cache = utils.viewer.budget.get;
  const {
    data,
    error: loadError,
    isFetching,
    refetch,
  } = trpc.viewer.budget.get.useQuery(
    { planId },
    {
      initialData: { budget: 0, entries: initialEntries ?? EMPTY_ENTRIES },
    }
  );
  const entries = data.entries;

  const categoryTotals: Record<CategoryKey, number> = {
    transport: 0,
    lodging: 0,
    food: 0,
    activities: activitiesTotal,
    shopping: 0,
    documents: 0,
  };
  for (const entry of entries) categoryTotals[entry.category] += entry.amount;
  const totalSpent = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);

  const createEntry = trpc.viewer.budget.createEntry.useMutation();
  const updateEntry = trpc.viewer.budget.updateEntry.useMutation();
  const deleteEntry = trpc.viewer.budget.deleteEntry.useMutation();
  const isPending = isWriting || createEntry.isPending || updateEntry.isPending || deleteEntry.isPending;

  const saveEntry = async (entry: ExpenseInput) => {
    if (writePending.current) return false;
    writePending.current = true;
    setIsWriting(true);
    let previous: BudgetQueryResult | undefined;
    setPersistError(null);
    try {
      await cache.cancel({ planId });
      previous = cache.getData({ planId });
      if (entry.id) {
        const updated = { ...entry, id: entry.id };
        cache.setData(
          { planId },
          (current) =>
            current && {
              ...current,
              entries: current.entries.map((item) => (item.id === updated.id ? updated : item)),
            }
        );
        await updateEntry.mutateAsync({ entry: updated });
      } else {
        const id = await createEntry.mutateAsync({ planId, payload: entry });
        cache.setData(
          { planId },
          (current) => current && { ...current, entries: [...current.entries, { ...entry, id }] }
        );
      }
      return true;
    } catch {
      if (previous) cache.setData({ planId }, previous);
      setPersistError(t("budgetSaveFailed"));
      return false;
    } finally {
      writePending.current = false;
      setIsWriting(false);
      void cache.invalidate({ planId });
    }
  };
  const removeEntry = async (entryId: string) => {
    if (writePending.current) return;
    writePending.current = true;
    setIsWriting(true);
    let previous: BudgetQueryResult | undefined;
    setPersistError(null);
    try {
      await cache.cancel({ planId });
      previous = cache.getData({ planId });
      cache.setData(
        { planId },
        (current) => current && { ...current, entries: current.entries.filter((item) => item.id !== entryId) }
      );
      await deleteEntry.mutateAsync({ entryId });
    } catch {
      if (previous) cache.setData({ planId }, previous);
      throw new Error("Unable to delete expense");
    } finally {
      writePending.current = false;
      setIsWriting(false);
      void cache.invalidate({ planId });
    }
  };

  return (
    <div className="bg-background flex h-full w-full flex-col gap-5 overflow-y-auto rounded-2xl border p-2 [scrollbar-color:var(--border)_transparent] scrollbar-thin [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent md:p-4">
      {loadError ? (
        <div className="space-y-2">
          <p role="alert" className="text-destructive-text text-sm">
            {t("budgetLoadFailed")}
          </p>
          <Button
            variant="ghost"
            disabled={isFetching}
            aria-busy={isFetching}
            onClick={() => void refetch()}
            className="gap-2">
            {isFetching ? <Spinner className="size-4" /> : null}
            {t("retry")}
          </Button>
        </div>
      ) : null}
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5 md:contents xl:flex">
          <Summary totalSpent={totalSpent} persistError={persistError} />
          <CategoryChart totalSpent={totalSpent} categoryTotals={categoryTotals} />
        </div>
        <div className="md:col-span-2 xl:col-span-1">
          <ExpenseTable
            entries={entries}
            onSave={saveEntry}
            onDelete={removeEntry}
            disabled={isPending || Boolean(loadError)}
          />
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
          : "inline-flex items-baseline gap-1 text-2xl font-semibold tracking-[-0.04em] tabular-nums"
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

export function CategoryChart({
  totalSpent,
  categoryTotals,
}: {
  totalSpent: number;
  categoryTotals: Record<CategoryKey, number>;
}) {
  const t = useTranslations();
  const maxCategoryValue = Math.max(...Object.values(categoryTotals), 0);

  return (
    <section
      aria-labelledby="budget-categories-heading"
      className="border-border bg-card h-fit rounded-2xl border p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="budget-categories-heading" className="font-semibold tracking-[-0.02em]">
          {t("categories")}
        </h2>
      </div>

      {totalSpent <= 0 ? (
        <p className="bg-muted/35 text-muted-foreground rounded-xl px-3 py-6 text-center text-sm">
          {t("noExpensesYet")}
        </p>
      ) : (
        <div>
          {CATEGORIES.map((category, index) => {
            const value = categoryTotals[category.key] || 0;
            const percent = maxCategoryValue > 0 ? Math.min(100, (value / maxCategoryValue) * 100) : 0;
            const { icon: Icon } = category;
            const label = t(CATEGORY_TRANSLATION_KEYS[category.key]);

            return (
              <div key={category.key} className="py-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon size={13} aria-hidden="true" className="text-muted-foreground shrink-0" />
                    <span className="truncate text-sm">{label}</span>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-xs font-medium tabular-nums">
                    ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(percent)}
                  aria-label={`${label} ${t("usage")} ${Math.round(percent)}%`}
                  className="bg-muted mt-2 h-1.5 rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function Summary({ totalSpent, persistError }: { totalSpent: number; persistError: string | null }) {
  const t = useTranslations();
  return (
    <section aria-label={t("totalSpent")}>
      <article className="border-border bg-card rounded-2xl border p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-semibold tracking-[-0.02em]">{t("totalSpent")}</h2>
            <p className="text-muted-foreground mt-0.5 text-sm">{t("allRecordedExpenses")}</p>
          </div>
          <span className="bg-card text-foreground inline-flex size-10 shrink-0 items-center justify-center rounded-xl">
            <DollarSign className="size-5" strokeWidth={2.25} aria-hidden="true" />
          </span>
        </div>

        <div className="mt-6">
          <AmountDisplay value={totalSpent} ariaLabel={t("totalSpent")} />
        </div>
        {persistError ? (
          <p role="alert" className="text-destructive-text mt-3 text-sm">
            {persistError}
          </p>
        ) : null}
      </article>
    </section>
  );
}

type ExpenseInput = Omit<Entry, "id"> & { id?: string };
type ExpenseDraft = Omit<ExpenseInput, "amount"> & { amount: string };
const EMPTY_DRAFT: ExpenseDraft = { description: "", category: "transport", amount: "" };

function ExpenseEditor({
  entry,
  onSave,
  onCancel,
  disabled,
}: {
  entry?: Entry;
  onSave: (entry: ExpenseInput) => Promise<boolean>;
  onCancel?: () => void;
  disabled: boolean;
}) {
  const t = useTranslations();
  const [draft, setDraft] = useState<ExpenseDraft>(() =>
    entry ? { ...entry, amount: String(entry.amount) } : EMPTY_DRAFT
  );
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const submitPending = useRef(false);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const amount = Number(draft.amount);
  const isInvalid = !Number.isFinite(amount) || !draft.description.trim() || amount <= 0;
  const save = async () => {
    if (submitPending.current || disabled) return;
    if (isInvalid) {
      setShowErrors(true);
      if (!draft.description.trim()) descriptionRef.current?.focus();
      else amountRef.current?.focus();
      return;
    }
    submitPending.current = true;
    setSubmitting(true);
    setShowErrors(false);
    try {
      if (await onSave({ ...draft, description: draft.description.trim(), amount })) {
        if (entry) onCancel?.();
        else setDraft({ ...EMPTY_DRAFT, category: draft.category });
      }
    } finally {
      setSubmitting(false);
      submitPending.current = false;
    }
  };
  const id = entry?.id ?? "new-row";
  return (
    <tr
      className="border-border"
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
      <td className="p-2">
        <input
          ref={descriptionRef}
          // biome-ignore lint/a11y/noAutofocus: editing replaces the focused Edit button with this input.
          autoFocus={Boolean(entry)}
          id={`description-${id}`}
          name="description"
          aria-label={t("descriptionLabel")}
          aria-invalid={(showErrors && !draft.description.trim()) || undefined}
          aria-describedby={showErrors && !draft.description.trim() ? `description-error-${id}` : undefined}
          value={draft.description}
          onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          placeholder={t("descriptionLabel")}
          autoComplete="off"
          readOnly={disabled || submitting}
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring md:h-10 md:text-sm"
        />
        {showErrors && !draft.description.trim() ? (
          <p id={`description-error-${id}`} role="alert" className="text-destructive-text mt-1 text-xs">
            {t("expenseDescriptionRequired")}
          </p>
        ) : null}
      </td>
      <td className="p-2">
        <select
          id={`category-${id}`}
          aria-label={t("categoryLabel")}
          value={draft.category}
          disabled={disabled || submitting}
          onChange={(event) => {
            const category = CATEGORIES.find(({ key }) => key === event.target.value);
            if (category) setDraft({ ...draft, category: category.key });
          }}
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring md:h-10 md:text-sm">
          {CATEGORIES.map(({ key }) => (
            <option key={key} value={key}>
              {t(CATEGORY_TRANSLATION_KEYS[key])}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2 text-right">
        <div className="relative">
          <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center">
            {currencySymbol}
          </span>
          <input
            id={`amount-${id}`}
            ref={amountRef}
            aria-label={t("amountLabel")}
            aria-invalid={(showErrors && (!Number.isFinite(amount) || amount <= 0)) || undefined}
            aria-describedby={
              showErrors && (!Number.isFinite(amount) || amount <= 0) ? `amount-error-${id}` : undefined
            }
            value={draft.amount}
            readOnly={disabled || submitting}
            onChange={(event) => setDraft({ ...draft, amount: event.target.value })}
            type="text"
            inputMode="decimal"
            placeholder={t("amountLabel")}
            autoComplete="off"
            className={inputClasses}
          />
        </div>
        {showErrors && (!Number.isFinite(amount) || amount <= 0) ? (
          <p id={`amount-error-${id}`} role="alert" className="text-destructive-text mt-1 text-xs">
            {t("expenseAmountInvalid")}
          </p>
        ) : null}
      </td>
      <td className="p-2 text-right">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => void save()}
            aria-label={entry ? t("saveEntry") : t("addExpense")}
            aria-busy={submitting}
            aria-disabled={disabled || submitting}
            className="border-border bg-background inline-flex size-11 items-center justify-center rounded-full border focus-visible:ring-2 focus-visible:ring-ring aria-disabled:opacity-50 md:size-8">
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
              className="border-border bg-background inline-flex size-11 items-center justify-center rounded-full border focus-visible:ring-2 focus-visible:ring-ring md:size-8">
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
  const [deletingEntry, setDeletingEntry] = useState<Entry | null>(null);
  const renderRow = (entry: Entry) => {
    if (editingId === entry.id)
      return (
        <ExpenseEditor
          key={entry.id}
          entry={entry}
          onSave={onSave}
          onCancel={() => setEditingId(null)}
          disabled={disabled}
        />
      );
    return (
      <tr key={entry.id} className="border-border">
        <th scope="row" className="p-2 text-left font-medium">
          {entry.description}
        </th>
        <td className="p-2">{t(CATEGORY_TRANSLATION_KEYS[entry.category])}</td>
        <td className="p-2 text-right">
          <AmountDisplay value={entry.amount} compact />
        </td>
        <td className="p-2 text-right">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingId(entry.id)}
              aria-label={t("editEntry")}
              disabled={disabled}
              className="border-border bg-background inline-flex size-11 items-center justify-center rounded-full border focus-visible:ring-2 focus-visible:ring-ring md:size-8">
              <Pencil className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingEntry(entry)}
              aria-label={t("deleteEntry")}
              disabled={disabled}
              className="border-border bg-background inline-flex size-11 items-center justify-center rounded-full border focus-visible:ring-2 focus-visible:ring-ring md:size-8">
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <section className="min-w-0" aria-labelledby="expenses-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="expenses-heading" className="font-semibold tracking-[-0.02em]">
          {t("expenses")}
        </h2>
      </div>
      <section
        className="overflow-x-auto overscroll-x-contain rounded-xl focus-visible:ring-2 focus-visible:ring-ring"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: allows keyboard users to scroll the expense table horizontally.
        tabIndex={0}
        aria-label={t("expenseTableCaption")}>
        <table
          aria-labelledby="expense-table-caption"
          className="w-full min-w-[36rem] border-separate border-spacing-y-2 text-sm">
          <caption id="expense-table-caption" className="sr-only">
            {t("expenseTableCaption")}
          </caption>
          <thead className="text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
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
          <tbody className="[&>tr]:rounded-xl [&>tr]:border [&>tr]:bg-background [&>tr]:shadow-sm">
            {entries.map(renderRow)}
            <ExpenseEditor onSave={onSave} disabled={disabled} />
          </tbody>
        </table>
      </section>
      <ConfirmationDialog
        open={Boolean(deletingEntry)}
        onOpenChange={(open) => {
          if (!open) setDeletingEntry(null);
        }}
        title={t("deleteEntry")}
        description={t("deleteExpenseConfirm")}
        confirmLabel={t("deleteAction")}
        cancelLabel={t("cancel")}
        closeLabel={t("close")}
        errorMessage={t("budgetDeleteFailed")}
        onConfirm={async () => {
          if (deletingEntry) await onDelete(deletingEntry.id);
        }}
      />
    </section>
  );
}
