# Search

Provides destination, address and activity suggestions through Geoapify, plus optional place images from Wikidata.

## How it works

Search inputs debounce text and cache results with TanStack Query. Client hooks call `/api/places/*` route handlers, which use server-only provider services. Geoapify requires `GEOAPIFY_KEY`; see [setup](../../../CONTRIBUTING.md).

| Endpoint | Purpose |
| --- | --- |
| `/api/places/city-country` | Destinations for plan creation and map positioning. |
| `/api/places/address` | Activity addresses. |
| `/api/places/search` | Activity/place suggestions. |
| `/api/places/details` | Place details and an optional Wikidata image. |

Selecting a place combines suggestion data with optional place details for the activity draft. If that request fails, the selection keeps its available address and coordinates. Selecting another place cancels the previous request.

## Main files

| File | Responsibility |
| --- | --- |
| [SuggestionCombobox.tsx](components/SuggestionCombobox.tsx) | Shared suggestion UI. |
| [searchHooks.ts](hooks/searchHooks.ts) | Query hooks and their endpoints. |
| [usePlaceSelection.ts](hooks/usePlaceSelection.ts) | Selected-place details and cancellation. |
| [GeoapifyService.ts](services/GeoapifyService.ts) | Query validation and Geoapify requests. |
| [WikidataService.ts](services/WikidataService.ts) | Optional image lookup. |

## Related docs

- [Architecture](../../../ARCHITECTURE.md)
- [Plan](../plan/README.md)
- [Feature guide](../README.md)
