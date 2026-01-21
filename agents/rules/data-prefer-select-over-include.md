---
title: Use Explicit Column Selection in Supabase Queries
impact: HIGH
impactDescription: Reduces data transfer and improves query performance
tags: supabase, database, performance, security
---

## Use Explicit Column Selection in Supabase Queries

**Impact: HIGH (Reduces data transfer and improves query performance)**

Using explicit column selection instead of `select('*')` in Supabase queries fetches only the fields you need, improving performance and preventing accidental exposure of sensitive data.

**Incorrect (using select('*') fetches all fields):**

```typescript
const { data: plan } = await supabase
  .from('plans')
  .select('*') // This gets ALL plan fields including sensitive ones
  .eq('id', planId)
  .single();
```

**Correct (using explicit column selection):**

```typescript
const { data: plan } = await supabase
  .from('plans')
  .select('id, title, destination_name, start_date, end_date') // Only needed fields
  .eq('id', planId)
  .single();

// For relational queries, specify nested columns explicitly
const { data: plan } = await supabase
  .from('plans')
  .select(`
    id, 
    title, 
    destination_name,
    plan_destinations (
      destinations (name, country)
    )
  `)
  .eq('id', planId)
  .single();
```

**Benefits:**
- **Performance**: Smaller payloads, faster queries
- **Security**: Prevents accidental exposure of sensitive fields (e.g., `user_id`, `created_at`)
- **Clarity**: Makes data requirements explicit

**Exception:** Use `select('*')` only when debugging or in admin tools where all fields are genuinely needed.