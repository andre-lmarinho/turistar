import { getDefaultActivityColor } from "@/features/app/planner/domain/constants/colors";
import { buildDaysFromInspirationData } from "./buildDaysFromInspirationData";

import type { InspirationData } from "./schemas";

const sample = {
  destination: "Test",
  itinerary: [
    {
      activities: [
        {
          title: "Visit Museum",
          startTime: "09:00",
          duration: 2,
          address: "Street 1",
          latitude: 1,
          longitude: 2,
        },
      ],
    },
  ],
};

describe("buildDaysFromInspirationData", () => {
  it("creates day plans from raw data", () => {
    const result = buildDaysFromInspirationData(sample);
    expect(result).toHaveLength(1);
    const day = result[0];
    expect(day.activities).toHaveLength(1);
    const act = day.activities[0];
    expect(act.title).toBe("Visit Museum");
    expect(act.startTime).toBe("09:00");
    expect(act.latitude).toBe(1);
    expect(act.longitude).toBe(2);
  });

  it("returns an empty list for empty itineraries", () => {
    const result = buildDaysFromInspirationData({
      destination: "Empty",
      itinerary: [],
    });

    expect(result).toEqual([]);
  });

  it("creates day plans across multiple days and activities", () => {
    const result = buildDaysFromInspirationData({
      destination: "Paris",
      itinerary: [
        {
          activities: [
            { title: "Coffee", startTime: "08:00", duration: 1, address: "Rue A" },
            { title: "Walk", startTime: "10:00", duration: 2, address: "Rue B" },
          ],
        },
        {
          activities: [{ title: "Dinner", startTime: "19:00", duration: 2, address: "Rue C" }],
        },
      ],
    });

    expect(result).toHaveLength(2);
    expect(result[0].activities).toHaveLength(2);
    expect(result[1].activities).toHaveLength(1);
    expect(result[0].activities[0].id).toBe("pa0-0");
    expect(result[0].activities[1].id).toBe("pa0-1");
    expect(result[1].activities[0].id).toBe("pa1-0");
  });

  it("applies defaults when optional fields are missing", () => {
    const result = buildDaysFromInspirationData({
      destination: "Defaults",
      itinerary: [
        {
          activities: [{ title: "Stroll", startTime: "11:00", duration: 1, address: "Street 2" }],
        },
      ],
    });

    const act = result[0].activities[0];
    expect(act.imageUrl).toBe("");
    expect(act.color).toBe(getDefaultActivityColor());
    expect(act.budget).toBeUndefined();
    expect(act.latitude).toBeUndefined();
    expect(act.longitude).toBeUndefined();
  });

  it("throws when itinerary entries are malformed", () => {
    const malformed = {
      destination: "Broken",
      itinerary: [{ activities: null }],
    } as unknown as InspirationData;

    expect(() => buildDaysFromInspirationData(malformed)).toThrow();
  });
});
