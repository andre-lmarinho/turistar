# Search

Provides destination, address and activity suggestions through Geoapify, plus optional place images from Wikidata.

## How it works

Search inputs debounce text and cache results with TanStack Query. Client hooks call `/api/places/*` route handlers, which use server-only provider services. Geoapify requires `GEOAPIFY_KEY`; see [setup](../../../CONTRIBUTING.md).

All three fields accept free text. After three characters and a 300 ms pause, the field requests suggestions. Arrow keys highlight an item; Enter or a click selects it. Tab keeps the typed text and moves focus to the next field. Clicking the field again reopens suggestions for its current text; returning focus with Shift+Tab alone does not. The list uses the autocomplete's portal, so it does not add height to the form.

| Endpoint                   | Purpose                                             |
| -------------------------- | --------------------------------------------------- |
| `/api/places/city-country` | Destinations for plan creation and map positioning. |
| `/api/places/address`      | Activity addresses.                                 |
| `/api/places/search`       | Activity/place suggestions.                         |
| `/api/places/details`      | Place details and an optional Wikidata image.       |

Selecting a place combines suggestion data with optional place details for the activity draft. If that request fails, the selection keeps its available address and coordinates. Selecting another place cancels the previous request.

## Main files

| File                                                                          | Responsibility                                                                                                           |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [SuggestionCombobox.tsx](../../ui/components/combobox/SuggestionCombobox.tsx) | List, keyboard navigation, focus and portal ([Base UI Autocomplete](https://base-ui.com/react/components/autocomplete)). |
| [PlaceSearchInput.tsx](components/PlaceSearchInput.tsx)                       | Free text or a selected place for destination, address and title.                                                        |
| [usePlaceSuggestions.ts](hooks/usePlaceSuggestions.ts)                        | Debounce, cache and cancellation.                                                                                        |
| [usePlaceSelection.ts](hooks/usePlaceSelection.ts)                            | Selected-place details and cancellation.                                                                                 |
| [GeoapifyService.ts](services/GeoapifyService.ts)                             | Query validation and Geoapify requests.                                                                                  |
| [WikidataService.ts](services/WikidataService.ts)                             | Optional image lookup.                                                                                                   |

## Related docs

- [Architecture](../../../ARCHITECTURE.md)
- [Plan](../plan/README.md)
- [Feature guide](../README.md)
