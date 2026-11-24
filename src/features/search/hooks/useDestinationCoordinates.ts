"use client";

import { useEffect, useState } from "react";
import { fetchPlaceSuggestions } from "../placeSuggestions";

export function useDestinationCoordinates(destination?: string) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    setCoordinates(null);
    if (!destination) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const [first] = await fetchPlaceSuggestions("city-country", destination, controller.signal);
        if (!controller.signal.aborted && first?.latitude != null && first.longitude != null) {
          setCoordinates({ lat: first.latitude, lng: first.longitude });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn("Destination coordinates lookup failed", {
            operation: "destinationCoordinates",
            destination,
            error,
          });
        }
      }
    };
    void load();
    return () => controller.abort();
  }, [destination]);
  return coordinates;
}
