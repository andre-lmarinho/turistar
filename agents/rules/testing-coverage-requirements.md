---
title: Maintain and Improve Test Coverage
impact: HIGH
impactDescription: Prevents bugs and enables confident refactoring
tags: testing, coverage, quality, ci
---

## Maintain and Improve Test Coverage

**Impact: HIGH**

Every PR must test the behavior it introduces or modifies. CI enforces a repository-wide floor and reports every production source file, including files not imported by tests. The floor should rise deliberately as coverage improves; it is not proof of correctness by itself.

**Coverage requirements:**
- Test changed behavior directly, especially authorization and data boundaries
- Keep the global floor green and raise it with focused test work
- Treat global coverage as a trend, not a substitute for meaningful assertions

**Incorrect (untested code):**

```typescript
// New function with no tests
export function calculateAvailability(user: User, date: Date): TimeSlot[] {
  // Complex logic here...
  // No corresponding test file
}
```

**Correct (comprehensive tests):**

```typescript
// calculateAvailability.ts
export function calculateAvailability(user: User, date: Date): TimeSlot[] {
  // Complex logic here...
}

// calculateAvailability.test.ts
describe("calculateAvailability", () => {
  it("returns empty array for user with no schedule", () => {
    const user = createMockUser({ schedules: [] });
    expect(calculateAvailability(user, new Date())).toEqual([]);
  });

  it("excludes busy times from available slots", () => {
    const user = createMockUser({
      schedules: [mockSchedule],
      busyTimes: [mockBusyTime],
    });
    const slots = calculateAvailability(user, new Date());
    expect(slots).not.toContainEqual(expect.objectContaining({
      start: mockBusyTime.start,
    }));
  });

  it("handles timezone conversions correctly", () => {
    // Test timezone edge cases
  });
});
```

**Addressing the "coverage isn't the full story" argument:**
Yes, we know coverage doesn't guarantee perfect tests. We know you can write meaningless tests that hit every line but test nothing meaningful. We know coverage is just one metric among many. But it's surely better to shoot for a high percentage than to have no idea where you are at all.

**Leverage AI for test generation:**
AI can quickly and intelligently build comprehensive test suites. Manual testing is more and more a thing of the past.
