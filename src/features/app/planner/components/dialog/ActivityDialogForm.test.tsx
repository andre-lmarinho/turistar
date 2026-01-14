import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import type { Activity } from "@/features/app/planner/domain/types/PlannerEntities";
import { ActivityDialogForm } from "./ActivityDialogForm";

const { mockUseAddressAutocomplete, mockUseDebounce, mockUseActivitySuggestions } = vi.hoisted(() => ({
  mockUseAddressAutocomplete: vi.fn(),
  mockUseDebounce: vi.fn(),
  mockUseActivitySuggestions: vi.fn(),
}));

vi.mock("@/features/app/planner/hooks/search/useAddressAutocomplete", () => ({
  useAddressAutocomplete: mockUseAddressAutocomplete,
}));
vi.mock("@/features/app/planner/hooks/search/useActivitySuggestions", () => ({
  useActivitySuggestions: mockUseActivitySuggestions,
}));
vi.mock("@/features/app/planner/hooks/PlannerContext", () => ({
  __esModule: true,
  usePlannerContext: () => ({ destCoords: { lat: 1, lng: 2 }, canEdit: true }),
}));
vi.mock("@/features/app/planner/hooks/search/useDebounce", () => ({
  useDebounce: mockUseDebounce,
}));

describe("ActivityDialogForm address autocomplete", () => {
  beforeEach(() => {
    mockUseAddressAutocomplete.mockReset();
    mockUseAddressAutocomplete.mockReturnValue({ results: [], loading: false, error: false });
    mockUseDebounce.mockImplementation((value: unknown) => value);
    mockUseActivitySuggestions.mockReturnValue({
      results: [],
      loading: false,
      error: false,
    });
  });

  it("saves selected address with coordinates", async () => {
    mockUseAddressAutocomplete.mockReturnValue({
      results: [{ name: "1 Infinite Loop, CA", latitude: 10, longitude: 20 }],
      loading: false,
      error: false,
    });

    const activity: Activity = { id: "1", title: "Test", color: "bg-[var(--color-0)]" };
    const handleSave = vi.fn();
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({} as Response);

    render(<ActivityDialogForm activity={activity} onSave={handleSave} color="bg-[var(--color-0)]" />);

    const input = screen.getByLabelText("Address");
    fireEvent.change(input, { target: { value: "1 In" } });

    const option = await screen.findByRole("option", { name: "1 Infinite Loop, CA" });
    fireEvent.mouseDown(option);

    await waitFor(() => expect(input).toHaveValue("1 Infinite Loop, CA"));

    const saveBtn = screen.getByRole("button", { name: "Update" });
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        address: "1 Infinite Loop, CA",
        latitude: 10,
        longitude: 20,
      })
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("updates the form when an activity suggestion is selected", async () => {
    mockUseActivitySuggestions.mockReturnValue({
      results: [
        {
          placeId: "pid",
          name: "Forte de Monte Serrat",
          formatted: "Forte, Salvador - BA, Brazil",
          latitude: -12.9,
          longitude: -38.5,
          description: "Historic fort",
        },
      ],
      loading: false,
      error: false,
    });

    const activity: Activity = { id: "1", title: "Test", color: "bg-[var(--color-0)]" };
    const handleSave = vi.fn();
    const handleSelectSuggestion = vi.fn();
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        details: {
          formatted: "Forte, Salvador - BA, Brazil",
          description: "Fort detail",
        },
        wikidataImageUrl: "https://image.jpg",
      }),
    } as unknown as Response);

    render(
      <ActivityDialogForm
        activity={activity}
        onSave={handleSave}
        color="bg-[var(--color-0)]"
        onSelectSuggestion={handleSelectSuggestion}
      />
    );

    const input = screen.getByLabelText("Title");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "For" } });

    const suggestionOption = await screen.findByRole("option", { name: /Forte/ });
    fireEvent.mouseDown(suggestionOption);

    await waitFor(() =>
      expect(handleSelectSuggestion).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Forte de Monte Serrat",
          address: "Forte, Salvador - BA, Brazil",
          latitude: -12.9,
          longitude: -38.5,
          description: "Fort detail",
          imageUrl: "https://image.jpg",
        })
      )
    );

    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining("/api/places/details?placeId=pid"));

    fetchSpy.mockRestore();
  });
});
