---
title: useEffect External System Sync Only
impact: HIGH
impactDescription: Quality and performance improvement, eliminates unnecessary re-renders
tags: react, hooks, performance, useEffect, quality, simplicity
---

## useEffect External System Sync Only

**Impact: HIGH**

useEffect should ONLY be used for synchronizing with external systems. Using useEffect for internal state synchronization causes unnecessary re-renders, harder debugging, and brittle logic. Before writing useEffect, ask: "Is this syncing with an EXTERNAL system?"

**Incorrect (using useEffect for internal state synchronization):**

```typescript
// BAD - Prop-state synchronization
useEffect(() => {
  setFormValue(activity);
}, [activity]);

// BAD - Data transformation
useEffect(() => {
  setFilteredData(data.filter(item => item.active));
}, [data]);

// BAD - Input value sync
useEffect(() => {
  setInputValue(budget);
}, [budget]);
```

**Correct (using proper React patterns):**

```typescript
// GOOD - Use key prop for prop-state sync
<Component key={activity?.id} activity={activity} />

// GOOD - Use useMemo for data transformation
const filteredData = useMemo(() => 
  data.filter(item => item.active), [data]
);

// GOOD - Derive directly during render
<input value={budget || ''} onChange={handleChange} />
```

## Decision Tree

Before writing useEffect, ask yourself ONE question:
**"Is this syncing with an EXTERNAL system?"**

✅ **If YES** → useEffect is appropriate  
❌ **If NO** → You probably don't need it

## Valid useEffect Use Cases (External Systems)

### Browser APIs
- `localStorage`, `sessionStorage` synchronization
- `document.title` updates
- `window.addEventListener` for DOM events
- `ResizeObserver`, `IntersectionObserver`
- `window.matchMedia` for responsive queries

### Network & External Services
- API calls (`fetch`, Axios, etc.)
- WebSocket connections
- Third-party library integrations (Supabase, Firebase, etc.)
- Real-time subscriptions

### DOM Manipulation
- Direct DOM element measurements
- Scroll position management
- Focus management
- Canvas or SVG manipulation

### Timers & Intervals
- `setTimeout`, `setInterval` for animations/debouncing
- Cleanup of timers

## Better Alternatives

| Use Case | Better Alternative |
|----------|-------------------|
| Data transformation | `useMemo` or calculate during render |
| Expensive calculation | `useMemo` |
| Resetting state on prop change | `key` prop |
| Event handling | Event handlers |
| Change detection | Calculate during render |
| External store subscription | `useSyncExternalStore` |

## Code Review Checklist

For each useEffect, verify:
- [ ] Is it syncing with an external system? ✅/❌
- [ ] Are all dependencies listed correctly?
- [ ] Is there proper cleanup?
- [ ] Could this be replaced with useMemo/useCallback?
- [ ] Could this be calculated during render?
- [ ] Could this use the key prop pattern instead?

## Examples from Our Codebase

### ✅ Good Examples
```typescript
// LocalStorage sync (external system)
useEffect(() => {
  const stored = localStorage.getItem(key);
  if (stored) setValue(JSON.parse(stored));
}, [key]);

// API call (external system)
useEffect(() => {
  fetchData().then(setData);
}, [query]);

// DOM event listener (external system)
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### ❌ Bad Examples 
```typescript
// Date range derivation
useEffect(() => {
  if (days.length > 0) {
    const sortedDays = [...days].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setDateRange({ 
      start: sortedDays[0].date, 
      end: sortedDays[sortedDays.length - 1].date 
    });
  }
}, [days]);

// Draft state sync
useEffect(() => {
  if (!isDragging) {
    setDraftDays(days);
  }
}, [days, isDragging]);
```

---

**Remember**: If you're not syncing with an external system, you probably don't need useEffect!