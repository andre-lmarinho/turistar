"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import type { DayPlan } from "@/features/activity/types";
import { useBudgetLedger } from "@/features/budget/hooks/useBudgetLedger";
import { summarizeBudget } from "@/features/budget/lib/summarizeBudget";
import type { CategoryKey, Entry } from "@/features/budget/types";
import { CATEGORIES } from "@/features/budget/types";
import { Button } from "@/ui/components/button/Button";
import { ConfirmationDialog } from "@/ui/components/dialog/ConfirmationDialog";
import { Check, ChevronDown, Pencil, Plus, Trash2, X } from "@/ui/components/icon/lucide-icons";
import { Spinner } from "@/ui/components/loading/Spinner";

const currencySymbol = "\u0024";
interface Props {
  planId: string;
  days: DayPlan[];
  initialEntries?: Entry[];
}

export function BudgetView({ planId, days, initialEntries }: Props) {
  const t = useTranslations();
  const ledger = useBudgetLedger(planId, initialEntries);
  const entries = ledger.data.entries;
  const { categoryTotals, totalSpent } = summarizeBudget(days, entries);

  return (
    <div className="bg-folio-paper text-folio-ink flex h-full w-full flex-col gap-5 overflow-y-auto border border-folio-line p-2 [scrollbar-color:var(--folio-line)_transparent] scrollbar-thin [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-folio-line [&::-webkit-scrollbar-track]:bg-transparent md:p-4">
      {ledger.error ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border border-folio-line bg-folio-white px-3 py-2">
          <p role="alert" className="text-destructive-text text-sm">
            {t("budgetRefreshFailed")}
          </p>
          <Button
            variant="ghost"
            disabled={ledger.isFetching}
            aria-busy={ledger.isFetching}
            onClick={() => void ledger.refetch()}
            className="gap-2 text-folio-ink hover:bg-folio-highlight focus-visible:ring-folio-coral">
            {ledger.isFetching ? <Spinner className="size-4" /> : null}
            {t("retry")}
          </Button>
        </div>
      ) : null}
      <div className="grid min-w-0 grid-cols-1 items-start gap-5">
        <Summary totalSpent={totalSpent} persistError={ledger.saveFailed ? t("budgetSaveFailed") : null} />
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <CategoryBreakdown totalSpent={totalSpent} categoryTotals={categoryTotals} />
          <ExpenseTable
            entries={entries}
            onSave={ledger.saveEntry}
            onDelete={ledger.removeEntry}
            disabled={ledger.isPending}
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
          : "inline-flex items-baseline gap-1 text-4xl font-semibold tracking-[-0.04em] tabular-nums"
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

function CategoryBreakdown({
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
      className="bg-folio-white h-fit border border-folio-line p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="budget-categories-heading" className="font-[Alegreya,Georgia,serif] text-xl font-semibold">
          {t("categories")}
        </h2>
      </div>

      {totalSpent <= 0 ? (
        <p className="bg-folio-highlight text-folio-ink-soft px-3 py-6 text-center text-sm">
          {t("noExpensesYet")}
        </p>
      ) : (
        <div>
          {CATEGORIES.map((category) => {
            const value = categoryTotals[category.key] || 0;
            const percent = maxCategoryValue > 0 ? Math.min(100, (value / maxCategoryValue) * 100) : 0;
            const { icon: Icon } = category;
            const label = t(category.translationKey);

            return (
              <div key={category.key} className="py-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon size={13} aria-hidden="true" className="text-folio-ink-soft shrink-0" />
                    <span className="min-w-0 text-sm leading-tight">{label}</span>
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
                  className="bg-folio-highlight mt-2 h-1.5">
                  <div className="bg-folio-coral h-full" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Summary({ totalSpent, persistError }: { totalSpent: number; persistError: string | null }) {
  const t = useTranslations();
  return (
    <section
      aria-labelledby="budget-total-heading"
      className="bg-folio-ink text-folio-white flex flex-wrap items-center justify-between gap-5 border border-folio-ink px-5 py-5 md:px-7">
      <div className="min-w-0">
        <h2 id="budget-total-heading" className="[font-family:Alegreya,Georgia,serif] text-xl font-semibold">
          {t("totalSpent")}
        </h2>
        <p className="text-folio-white/80 mt-0.5 text-sm">{t("allRecordedExpenses")}</p>
      </div>
      <div className="text-folio-citron">
        <AmountDisplay value={totalSpent} ariaLabel={t("totalSpent")} />
      </div>
      {persistError ? (
        <p role="alert" className="text-folio-white w-full text-sm">
          {persistError}
        </p>
      ) : null}
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
      className={`h-12 transition-colors duration-200 ease-out motion-reduce:transition-none ${entry ? "bg-folio-highlight" : ""}`}
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
      <td className="p-2 align-middle">
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
          className={`h-9 w-full border border-folio-input bg-folio-white px-2 py-0 text-sm leading-normal outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-folio-input-hover focus:ring-2 focus:ring-folio-coral motion-reduce:transition-none ${entry ? "bg-folio-white" : ""}`}
        />
        {showErrors && !draft.description.trim() ? (
          <p id={`description-error-${id}`} role="alert" className="text-destructive-text mt-1 text-xs">
            {t("expenseDescriptionRequired")}
          </p>
        ) : null}
      </td>
      <td className="p-2 align-middle">
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
            className={`h-9 w-full appearance-none border border-folio-input bg-folio-white py-0 pr-8 pl-2 text-sm leading-normal outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-folio-input-hover focus:ring-2 focus:ring-folio-coral motion-reduce:transition-none ${entry ? "bg-folio-white" : ""}`}>
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
      <td className="px-2 py-1 text-right align-middle">
        <div className="relative">
          <span className="text-folio-ink-soft pointer-events-none absolute inset-y-0 left-2 flex items-center">
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
            className="h-9 w-full border border-folio-input bg-folio-white pr-2 pl-7 text-right text-sm font-semibold tabular-nums outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out focus:ring-2 focus:ring-folio-coral focus:ring-offset-1 motion-reduce:transition-none"
          />
        </div>
        {showErrors && (!Number.isFinite(amount) || amount <= 0) ? (
          <p id={`amount-error-${id}`} role="alert" className="text-destructive-text mt-1 text-xs">
            {t("expenseAmountInvalid")}
          </p>
        ) : null}
      </td>
      <td className="px-2 py-1 text-right align-middle">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => void save()}
            aria-label={entry ? t("saveEntry") : t("addExpense")}
            aria-busy={submitting}
            aria-disabled={disabled || submitting}
            className="border-folio-line bg-folio-white hover:bg-folio-highlight active:bg-folio-highlight inline-flex size-8 cursor-pointer items-center justify-center border transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-folio-coral motion-reduce:transition-none aria-disabled:opacity-50">
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
              className="border-folio-line bg-folio-white hover:bg-folio-highlight active:bg-folio-highlight inline-flex size-8 cursor-pointer items-center justify-center border transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-folio-coral motion-reduce:transition-none">
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
      <tr
        key={entry.id}
        className="h-12 transition-colors duration-200 ease-out motion-reduce:transition-none hover:bg-folio-highlight/50">
        <th scope="row" className="p-2 text-left align-middle font-medium leading-normal">
          {entry.description}
        </th>
        <td className="p-2 align-middle leading-normal">
          {t(CATEGORIES.find(({ key }) => key === entry.category)?.translationKey ?? "categories")}
        </td>
        <td className="p-2 text-right align-middle">
          <AmountDisplay value={entry.amount} compact />
        </td>
        <td className="p-2 text-right align-middle">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingId(entry.id)}
              aria-label={t("editEntry")}
              disabled={disabled}
              className="border-folio-line bg-folio-white hover:bg-folio-highlight active:bg-folio-highlight inline-flex size-8 cursor-pointer items-center justify-center border transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-folio-coral motion-reduce:transition-none">
              <Pencil className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingEntry(entry)}
              aria-label={t("deleteEntry")}
              disabled={disabled}
              className="border-folio-line bg-folio-white hover:bg-folio-highlight active:bg-folio-highlight inline-flex size-8 cursor-pointer items-center justify-center border transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-folio-coral motion-reduce:transition-none">
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <section
      className="bg-folio-white flex min-w-0 flex-col border border-folio-line p-4"
      aria-labelledby="expenses-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="expenses-heading" className="font-[Alegreya,Georgia,serif] text-xl font-semibold">
          {t("expenses")}
        </h2>
      </div>
      <section
        className="overflow-x-auto overscroll-x-contain focus-visible:ring-2 focus-visible:ring-folio-coral"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: allows keyboard users to scroll the expense table horizontally.
        tabIndex={0}
        aria-label={t("expenseTableCaption")}>
        <table aria-labelledby="expense-table-caption" className="w-full min-w-xl border-collapse text-sm">
          <caption id="expense-table-caption" className="sr-only">
            {t("expenseTableCaption")}
          </caption>
          <thead className="text-folio-ink-soft text-xs uppercase tracking-wide">
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
          <tbody className="[&>tr]:border-b [&>tr]:border-folio-line">
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
