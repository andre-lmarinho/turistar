---
title: Composition Over Prop Drilling
impact: MEDIUM
impactDescription: Reduces prop complexity and improves component maintainability
tags: react, patterns, composition, context, prop-drilling
---

## Composition Over Prop Drilling

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