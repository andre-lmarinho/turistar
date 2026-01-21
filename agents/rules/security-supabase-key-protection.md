---
title: Supabase Key Protection
impact: CRITICAL
impactDescription: Prevents catastrophic security breaches and credential exposure
tags: security, supabase, keys, credentials, secrets
---

## Supabase Key Protection

Supabase service role keys have admin privileges and must never be exposed in client-side code, API responses, or logs.

**Incorrect (exposing service role key):**

```typescript
// API route exposing sensitive key
export async function GET() {
  return Response.json({
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY, // ❌ NEVER do this
    message: "Here are your admin credentials!"
  });
}

// Client component with embedded key
export function ClientComponent() {
  const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // ❌ NEVER embed keys
  return <div>Key: {serviceKey}</div>;
}
```

**Correct (proper key protection):**

```typescript
// API route - never expose keys
export async function GET() {
  const data = await getUserData();
  return Response.json({ data }); // ✅ Only return necessary data
}

// Server-side usage only
export async function serverAction() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ Safe on server only
  );
  
  return await supabase.from('users').select('*');
}
```

**Key Rules:**

- ❌ Never expose service role keys in API responses or client-side code
- ✅ Use service role keys only on server-side
- ✅ Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side access

**Benefits:**

Prevents catastrophic data breaches through proper credential isolation.