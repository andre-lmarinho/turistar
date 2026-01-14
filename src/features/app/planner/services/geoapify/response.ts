import type { GeoapifyFeature, GeoapifyResponse } from "./types";

export function resolveGeoapifyFeatures(data: GeoapifyResponse): GeoapifyFeature[] {
  if ("features" in data) {
    return data.features;
  }
  if ("results" in data) {
    return data.results.map((result) => ({ properties: result }));
  }
  return [];
}
