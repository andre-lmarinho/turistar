import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BudgetRowView } from '@/features/planner/components/budget/BudgetRowView';
import { BudgetRowEdit } from '@/features/planner/components/budget/BudgetRowEdit';
import { BudgetRowNew } from '@/features/planner/components/budget/BudgetRowNew';
import type { Entry, CategoryKey } from '@/features/planner/types/budget';

const setDescMock = vi.fn();
const setCatMock = vi.fn();
const setAmountMock = vi.fn();

vi.mock('@/features/planner/hooks/budget/BudgetContext', () => ({
  useBudgetContext: () => ({
    desc: '',
    setDesc: setDescMock as unknown as Dispatch<SetStateAction<string>>,
    cat: 'transport' as CategoryKey,
    setCat: setCatMock as unknown as Dispatch<SetStateAction<CategoryKey>>,
    setAmount: setAmountMock as unknown as Dispatch<SetStateAction<number>>,
  }),
}));

function renderInTable(node: React.ReactNode) {
  return render(
    <table>
      <tbody>{node}</tbody>
    </table>
  );
}

describe('BudgetRowView', () => {
  it('calls onEdit when the edit button is clicked', () => {
    const onEdit = vi.fn();
    const entry: Entry = { id: '1', description: 'Hotel', category: 'lodging', amount: 120 };

    renderInTable(<BudgetRowView index={0} entry={entry} onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Edit entry'));

    expect(onEdit).toHaveBeenCalledWith(0);
  });

  it('calls onDelete when the delete button is clicked', () => {
    const onDelete = vi.fn();
    const entry: Entry = { id: '2', description: 'Dinner', category: 'food', amount: 40 };

    renderInTable(<BudgetRowView index={3} entry={entry} onEdit={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getByLabelText('Delete entry'));

    expect(onDelete).toHaveBeenCalledWith(3);
  });
});

describe('BudgetRowEdit', () => {
  const baseEntry: Entry = { id: '3', description: 'Taxi', category: 'transport', amount: 25 };

  it('calls onSave with the current entry when the save button is clicked', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const setEditEntryMock = vi.fn();
    const setEditAmountInput = vi.fn();

    renderInTable(
      <BudgetRowEdit
        index={1}
        editEntry={baseEntry}
        setEditEntry={setEditEntryMock as unknown as Dispatch<SetStateAction<Entry | null>>}
        editAmountInput={String(baseEntry.amount)}
        setEditAmountInput={setEditAmountInput}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByLabelText('Save entry'));

    expect(onSave).toHaveBeenCalledWith(1, baseEntry);
  });

  it('calls onCancel when the cancel button is clicked', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const setEditEntryMock = vi.fn();
    const setEditAmountInput = vi.fn();

    renderInTable(
      <BudgetRowEdit
        index={5}
        editEntry={baseEntry}
        setEditEntry={setEditEntryMock as unknown as Dispatch<SetStateAction<Entry | null>>}
        editAmountInput={String(baseEntry.amount)}
        setEditAmountInput={setEditAmountInput}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByLabelText('Cancel edit'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('BudgetRowNew', () => {
  beforeEach(() => {
    setDescMock.mockClear();
    setCatMock.mockClear();
    setAmountMock.mockClear();
  });

  it('calls onAdd when the add button is clicked', () => {
    const onAdd = vi.fn();
    const setAmountInput = vi.fn();

    renderInTable(<BudgetRowNew amountInput="" setAmountInput={setAmountInput} onAdd={onAdd} />);

    fireEvent.click(screen.getByLabelText('Add expense'));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
