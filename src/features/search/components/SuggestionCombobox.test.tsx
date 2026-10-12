import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { SuggestionCombobox } from "./SuggestionCombobox";

const options = [
  { id: "museum", label: "Museum", value: "Museum" },
  { id: "park", label: "Park", value: "Park" },
];

const scrollIntoView = vi.fn();
beforeAll(() =>
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoView,
  })
);
afterAll(() => Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView"));

function Search({ onSelect = vi.fn(), onEscape = vi.fn() }) {
  const [open, setOpen] = useState(true);
  return (
    <dialog open aria-label="Editor" onKeyDown={onEscape}>
      <SuggestionCombobox
        label="Place"
        value="My own title"
        open={open}
        onOpenChange={setOpen}
        onInputChange={vi.fn()}
        options={options}
        mapOptionToSelection={(option) => option.value}
        onSelect={onSelect}
      />
      <button type="button">Next field</button>
    </dialog>
  );
}

describe("SuggestionCombobox", () => {
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
    expect(changeOpen).toHaveBeenLastCalledWith(true);

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
    fireEvent.click(screen.getByRole("option", { name: "Museum" }));
    expect(select).toHaveBeenCalledExactlyOnceWith("Museum", options[0]);
    expect(input).toHaveFocus();
  });
});
