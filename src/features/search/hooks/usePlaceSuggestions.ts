"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchPlaceSuggestions } from "../placeSuggestions";
import type { PlaceSearch } from "../types";

export function usePlaceSuggestions(
  source: PlaceSearch,
  text: string,
  latitude?: number,
  longitude?: number
) {
  const [settled, setSettled] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSettled(text), 300);
    return () => clearTimeout(timer);
  }, [text]);

  const query = settled === text ? text : "";
  return useQuery({
    queryKey: ["place-suggestions", source, query, latitude, longitude],
    enabled: !!query,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    queryFn: ({ signal }) => fetchPlaceSuggestions(source, query, signal, latitude, longitude),
  });
}
