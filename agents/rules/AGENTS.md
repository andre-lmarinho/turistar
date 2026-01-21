# Engineering Best Practices

**Version 1.0.0**  
Travel Planner Engineering  
January 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases at Travel Planner. Humans  
> may also find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

---

## Abstract

Comprehensive engineering guide covering architecture, security, data layer, code quality, and design patterns for modern TypeScript applications. Contains 20+ rules across 9 categories, prioritized by impact from critical (security, architecture) to incremental (patterns). Each rule includes detailed explanations, real-world examples comparing incorrect vs. correct implementations, and specific guidance to ensure maintainable, scalable code.

---

## Table of Contents

1. [Architecture](#1-architecture) — **CRITICAL**
   - 1.1 [Page Level Authentication](#11-page-level-authentication)
   - 1.2 [Vertical Slices](#12-vertical-slices)
2. [Code Quality](#2-code-quality) — **CRITICAL**
   - 2.1 [File Naming Conventions](#21-file-naming-conventions)
   - 2.2 [Simplicity](#22-simplicity)
3. [Security](#3-security) — **CRITICAL**
   - 3.1 [Supabase Key Protection](#31-supabase-key-protection)
4. [Data Layer](#4-data-layer) — **HIGH**
   - 4.1 [Prefer Select Over Include](#41-prefer-select-over-include)
   - 4.2 [Repository Pattern](#42-repository-pattern)
   - 4.3 [Repository Methods](#43-repository-methods)
   - 4.4 [DTO Boundaries](#44-dto-boundaries)
5. [API Design](#5-api-design) — **HIGH**
6. [Performance](#6-performance) — **HIGH**
   - *See `performance/rules/` directory for detailed performance rules*
7. [UI/UX](#7-uiux) — **HIGH**
   - 7.1 [Interface Guidelines](#71-interface-guidelines)
8. [Testing](#8-testing) — **MEDIUM-HIGH**
   - 8.1 [Coverage Requirements](#81-coverage-requirements)
9. [Design Patterns](#9-design-patterns) — **MEDIUM**
   - 9.1 [Early Returns](#91-early-returns)
   - 9.2 [Composition Over Prop Drilling](#92-composition-over-prop-drilling)

---

## 1. Architecture

**Impact: CRITICAL**

Vertical Slice Architecture and Domain-Driven Design patterns that form the foundation of our codebase organization.

### 1.1 Page Level Authentication

**Impact: CRITICAL (prevents unauthorized access)**

Authorization checks must be performed in pages, not layouts. Layouts handle UI structure, pages handle access control.

**Incorrect (layout-level auth):**

```typescript
// Bad: Authorization in layout
export default function Layout({ children }) {
  const session = await auth();
  
  if (!session) {
    return <Login />;
  }
  
  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  );
}
```

**Correct (page-level auth):**

```typescript
// Good: Authorization in page
export default function Layout({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  );
}

export default function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  return <DashboardContent />;
}
```

### 1.2 Vertical Slices

**Impact: CRITICAL (maintains domain cohesion)**

Organize code by domain/business capability, not technical layers. Each vertical slice should be self-contained.

**Incorrect (technical layering):**

```
src/
  components/
    UserProfile.tsx
    ActivityForm.tsx
  services/
    userService.ts
    activityService.ts
  repositories/
    userRepository.ts
    activityRepository.ts
```

**Correct (vertical slices):**

```
src/
  features/
    auth/
      components/
      services/
      repositories/
    activity/
      components/
      services/
      repositories/
    users/
      components/
      services/
      repositories/
```

---

## 2. Code Quality

**Impact: CRITICAL**

Standards for maintaining high-quality, maintainable code including naming conventions and simplicity.

### 2.1 File Naming Conventions

**Impact: CRITICAL (ensures consistency and discoverability)**

Consistent file naming makes codebase predictable and easy to navigate.

**Repository Files:**

```typescript
// Bad: Generic names, no suffix
export class PlanRepo { }

// Good: Clear naming with Repository suffix
export class PlanRepository { }
```

**Service Files:**

```typescript
// Bad: Generic names
export class Manager { }

// Good: Descriptive names with Service suffix
export class MembershipService { }
```

**Component Files:**

```typescript
// Bad: camelCase or kebab-case
export const userProfile = () => { };

// Good: PascalCase for components
export const UserProfile = () => { };
```

**Benefits:**

Predictable file structure with better discoverability and consistency.

### 2.2 Simplicity

**Impact: CRITICAL (prevents technical complexity)**

Prioritize clarity and maintainability over clever optimizations or complex patterns.

**Incorrect (over-engineered):**

```typescript
// Bad: Complex factory pattern for simple case
class ButtonFactory {
  static createButton(config: ButtonConfig) {
    const strategy = this.getStrategy(config.variant);
    return strategy.create(config);
  }
  
  private static getStrategy(variant: string) {
    // Complex strategy resolution
  }
}
```

**Correct (simple and direct):**

```typescript
// Good: Simple function for simple case
export function createButton(variant: 'primary' | 'secondary', children: React.ReactNode) {
  return <button className={`btn btn-${variant}`}>{children}</button>;
}
```

---

## 3. Security

**Impact: CRITICAL**

Security patterns that prevent data breaches and protect user information.

### 3.1 Supabase Key Protection

**Impact: CRITICAL (prevents catastrophic security breaches)**

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

---

## 4. Data Layer

**Impact: HIGH**

Repository patterns, DTOs, and technology isolation to prevent coupling and enable maintainability.

### 4.1 Prefer Select Over Include

**Impact: HIGH (improves performance and security)**

Use explicit column selection in Supabase queries. Avoid `select('*')` to fetch only necessary data.

**Incorrect (select all):**

```typescript
// Bad: Selects all columns, including sensitive data
const { data } = await supabase
  .from('users')
  .select('*') // ❌ Fetches everything
  .eq('id', userId)
  .single();
```

**Correct (explicit selection):**

```typescript
// Good: Selects only needed columns
const { data } = await supabase
  .from('users')
  .select('id, name, email, created_at') // ✅ Explicit columns
  .eq('id', userId)
  .single();
```

### 4.2 Repository Pattern

**Impact: HIGH (isolates database technology)**

Isolate database logic behind repository interfaces to enable testing and prevent coupling.

**Incorrect (direct database access):**

```typescript
// Bad: Direct Supabase access throughout codebase
export async function getUser(id: string) {
  return await supabase.from('users').select('*').eq('id', id).single();
}

export async function updateUser(id: string, data: Partial<User>) {
  return await supabase.from('users').update(data).eq('id', id);
}
```

**Correct (repository abstraction):**

```typescript
// Good: Repository abstraction
interface UserRepository {
  findById(id: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
}

export class SupabaseUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const { data } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', id)
      .single();
    return data;
  }
  
  async update(id: string, data: Partial<User>): Promise<User> {
    const { data } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    return data;
  }
}
```

### 4.3 Repository Methods

**Impact: HIGH (consistent interface patterns)**

Use consistent naming conventions for repository methods to ensure predictability.

**Incorrect (inconsistent naming):**

```typescript
// Bad: Inconsistent method names
class UserRepository {
  getUser(id: string) { }
  createUser(user: User) { }
  removeUser(id: string) { }
  fetchUserByEmail(email: string) { }
}
```

**Correct (consistent naming):**

```typescript
// Good: Consistent naming patterns
class UserRepository {
  findById(id: string): Promise<User | null> { }
  create(data: CreateUserDto): Promise<User> { }
  delete(id: string): Promise<void> { }
  findByEmail(email: string): Promise<User | null> { }
}
```

### 4.4 DTO Boundaries

**Impact: HIGH (clear contract boundaries)**

Use Data Transfer Objects at architectural boundaries to define clear contracts and prevent over-fetching.

**Incorrect (entity leakage):**

```typescript
// Bad: Returning internal entities directly
export async function GET(req: Request) {
  const users = await userRepository.findAll();
  return Response.json(users); // ❌ Includes internal fields
}
```

**Correct (DTO boundaries):**

```typescript
// Good: Using DTOs for external contracts
interface UserDto {
  id: string;
  name: string;
  email: string;
}

export async function GET(req: Request) {
  const users = await userRepository.findAll();
  const userDtos: UserDto[] = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email
  }));
  return Response.json(userDtos); // ✅ Clean contract
}
```

---

## 5. API Design

**Impact: HIGH**

Controller patterns, API stability, and proper separation of HTTP concerns from business logic.

*See individual rule files in `rules/` directory for API design patterns.*

---

## 6. Performance

**Impact: HIGH**

*See `performance/rules/` directory for comprehensive performance rules including:*
- Eliminating Waterfalls (CRITICAL)
- Bundle Size Optimization (CRITICAL) 
- Server-Side Performance (HIGH)
- Client-Side Data Fetching (MEDIUM-HIGH)
- Re-render Optimization (MEDIUM)
- And more...

---

## 7. UI/UX

**Impact: HIGH**

General standards for UI and UX design patterns.

### 7.1 Interface Guidelines

**Impact: HIGH (consistent user experience)**

*See `uiux-interface-guidelines.md` for comprehensive UI/UX best practices.*

---

## 8. Testing

**Impact: MEDIUM-HIGH**

Test coverage requirements and testing strategies for maintaining code quality.

### 8.1 Coverage Requirements

**Impact: MEDIUM-HIGH (maintains code quality)**

Maintain 80%+ test coverage for new code to ensure reliability and catch regressions.

**Requirements:**
- Unit tests: 85%+ coverage
- Integration tests: Critical paths covered
- E2E tests: User workflows covered

---

## 9. Design Patterns

**Impact: MEDIUM**

Factory patterns, dependency injection, and other design patterns for clean, maintainable code.

### 9.1 Early Returns

**Impact: MEDIUM (reduces nesting and improves readability)**

Use early returns to reduce nesting. Handle edge cases at function start, then focus on happy path.

**Incorrect (deep nesting):**

```typescript
// Bad: Deep nesting with multiple if statements
export async function getUserPlan(userId, planId) {
  const user = await getUserById(userId);
  if (user) {
    const plan = await getPlanById(planId);
    if (plan) {
      if (plan.ownerId === userId) {
        return { user, plan };
      } else {
        throw new Error('Not plan owner');
      }
    } else {
      throw new Error('Plan not found');
    }
  } else {
    throw new Error('User not found');
  }
}
```

**Correct (early returns):**

```typescript
// Good: Early returns for validation, then happy path
export async function getUserPlan(userId, planId) {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const plan = await getPlanById(planId);
  if (!plan) {
    throw new Error('Plan not found');
  }

  if (plan.ownerId !== userId) {
    throw new Error('Not plan owner');
  }

  // Happy path - all validation passed
  return { user, plan };
}
```

**Benefits:**

Cleaner code flow with better readability and maintainability.

### 9.2 Composition Over Prop Drilling

**Impact: MEDIUM (reduces prop complexity and improves maintainability)**

Use React children and context instead of passing props through multiple components. Prop drilling creates tight coupling.

**Incorrect (prop drilling):**

```typescript
// Bad: Props passed through multiple levels
export function Layout({ user, theme, onLogout, children }) {
  return (
    <div className={theme.mode}>
      <Header user={user} onLogout={onLogout} />
      <main>{children}</main>
    </div>
  );
}

export function Header({ user, onLogout }) {
  return (
    <header>
      <span>Welcome, {user.name}</span>
      <button onClick={onLogout}>Logout</button>
    </header>
  );
}
```

**Correct (composition with context):**

```typescript
// Good: Using context for shared state
const AuthContext = createContext({ user: null, logout: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function Layout({ children }) {
  const { theme } = useTheme();
  
  return (
    <div className={theme.mode}>
      <Header />
      <main>{children}</main>
    </div>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header>
      <span>Welcome, {user.name}</span>
      <button onClick={logout}>Logout</button>
    </header>
  );
}
```

**Benefits:**

Cleaner component hierarchy with better maintainability and reusability.

---

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/architecture-vertical-slices.md
rules/security-supabase-key-protection.md
rules/patterns-early-returns.md
rules/quality-file-naming-conventions.md
performance/rules/bundle-barrel-imports.md
performance/rules/async-parallel.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references

## Core Principles

> We are building infrastructure that must almost never fail. To achieve this, we move fast while shipping amazing quality software with no shortcuts or compromises.

The rules in this directory encode specific practices that enable this philosophy through architecture, security, performance, and maintainability patterns.