import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { SuggestionOption } from "./SuggestionCombobox";
import { SuggestionCombobox } from "./SuggestionCombobox";

const options = [
  { id: "museum", label: "Museum", value: "Museum" },
  { id: "park", label: "Park", value: "Park" },
];

type SearchProps = {
  onSelect?: (selection: string, option: SuggestionOption<string>) => void;
  onEscape?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  suggestions?: SuggestionOption<string>[];
  emptyMessage?: string;
};

const scrollIntoView = vi.fn();
beforeAll(() =>
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoView,
  })
);
afterAll(() => Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView"));

function Search({
  onSelect = vi.fn(),
  onEscape = vi.fn(),
  suggestions = options,
  emptyMessage,
}: SearchProps) {
  const [open, setOpen] = useState(true);
  return (
    <section aria-label="Editor" onKeyDown={onEscape}>
      <div data-testid="search-root">
        <SuggestionCombobox
          label="Place"
          value="My own title"
          open={open}
          onOpenChange={setOpen}
          onInputChange={vi.fn()}
          options={suggestions}
          emptyMessage={emptyMessage}
          mapOptionToSelection={(option) => option.value}
          onSelect={onSelect}
        />
      </div>
      <button type="button">Next field</button>
    </section>
  );
}

describe("SuggestionCombobox", () => {
  it("renders suggestions in the popover portal", () => {
    render(<Search />);

    expect(screen.getByTestId("search-root")).not.toContainElement(screen.getByRole("listbox"));
  });

  it("stays closed when the input regains focus after an outside click", () => {
    render(<Search />);

    fireEvent.click(screen.getByRole("button", { name: "Next field" }));
    fireEvent.focus(screen.getByRole("combobox", { name: "Place" }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("keeps the empty state open when it is clicked", () => {
    render(<Search suggestions={[]} emptyMessage="No suggestions found" />);

    const emptyState = screen.getByText("No suggestions found");
    fireEvent.click(emptyState);

    expect(emptyState).toBeInTheDocument();
  });

  it("forwards native focus and blur events alongside dedicated callbacks and popup behavior", () => {
    const nativeFocus = vi.fn();
    const nativeBlur = vi.fn();
    const focus = vi.fn();
    const blur = vi.fn();
    const changeOpen = vi.fn();
    render(
      <SuggestionCombobox
        label="Place"
        value=""
        open={false}
        onOpenChange={changeOpen}
        onInputChange={vi.fn()}
        options={options}
        mapOptionToSelection={(option) => option.value}
        onSelect={vi.fn()}
        onFocus={focus}
        onBlur={blur}
        inputProps={{ onFocus: nativeFocus, onBlur: nativeBlur }}
      />
    );
    const input = screen.getByRole("combobox", { name: "Place" });
    fireEvent.focus(input);
    expect(nativeFocus).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ type: "focus", target: input })
    );
    expect(focus).toHaveBeenCalledOnce();
    expect(changeOpen).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(nativeBlur).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ type: "blur", target: input })
    );
    expect(blur).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ type: "blur", target: input }));
    expect(changeOpen).toHaveBeenLastCalledWith(false);
  });

  it("lets Tab leave the field without selecting a suggestion", () => {
    const select = vi.fn();
    render(<Search onSelect={select} />);
    const input = screen.getByRole("combobox", { name: "Place" });
    expect(fireEvent.keyDown(input, { key: "Tab" })).toBe(true);
    expect(select).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveValue("My own title");
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("only accepts a suggestion explicitly highlighted with the arrow keys", () => {
    const select = vi.fn();
    render(<Search onSelect={select} />);
    const input = screen.getByRole("combobox", { name: "Place" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(select).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
    expect(screen.getByRole("option", { name: "Park" })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(select).toHaveBeenCalledExactlyOnceWith("Park", options[1]);
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("dismisses suggestions before propagating Escape to a parent dialog", () => {
    const dismiss = vi.fn();
    render(<Search onEscape={dismiss} />);
    const input = screen.getByRole("combobox", { name: "Place" });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(dismiss).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(dismiss).toHaveBeenCalledOnce();
  });

  it("selects through click and keeps focus on the input", () => {
    const select = vi.fn();
    render(<Search onSelect={select} />);
    const input = screen.getByRole("combobox", { name: "Place" });
    fireEvent.focus(input);
    const option = screen.getByRole("option", { name: "Museum" });
    expect(option).toHaveClass("cursor-pointer", "hover:bg-folio-highlight");
    fireEvent.click(option);
    expect(select).toHaveBeenCalledExactlyOnceWith("Museum", options[0]);
    expect(input).toHaveFocus();
  });
});
