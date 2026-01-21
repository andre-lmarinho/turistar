---
title: Repository Method Naming Conventions
impact: HIGH
impactDescription: Improves code discoverability and reusability
tags: data, repository, naming, conventions, methods
---

## Repository Method Naming Conventions

**Impact: HIGH**

Repository methods should follow consistent naming conventions to improve discoverability and promote code reuse across different features.

### Rule 1: Don't include the repository's entity name in method names

Method names should be concise and avoid redundancy since the repository class name already indicates the entity type.

```typescript
// Good - Concise method names
class BookingRepository {
  findById(id: string) { ... }
  findByUserId(userId: string) { ... }
  create(data: BookingCreateInput) { ... }
  delete(id: string) { ... }
}

// Bad - Redundant entity name in methods
class BookingRepository {
  findBookingById(id: string) { ... }
  findBookingByUserId(userId: string) { ... }
  createBooking(data: BookingCreateInput) { ... }
  deleteBooking(id: string) { ... }
}
```

### Rule 2: Use `include` or similar keywords for methods that fetch relational data

When a method retrieves additional related entities, make this explicit in the method name using keywords like `include`, `with`, or `andRelations`.

```typescript
// Good - Clear indication of included relations
class PlanRepository {
  constructor(private supabase: SupabaseClient) {}

  findById(id: string) {
    return this.supabase
      .from('plans')
      .select('id, title, destination_name')
      .eq('id', id)
      .single();
  }

  findByIdIncludeDestinations(id: string) {
    return this.supabase
      .from('plans')
      .select(`
        id, 
        title, 
        destination_name,
        plan_destinations (
          destinations (name, country)
        )
      `)
      .eq('id', id)
      .single();
  }

  findByIdIncludeMembersAndDestinations(id: string) {
    return this.supabase
      .from('plans')
      .select(`
        id, 
        title, 
        destination_name,
        plan_members (
          user_id, 
          tier
        ),
        plan_destinations (
          destinations (name, country)
        )
      `)
      .eq('id', id)
      .single();
  }
}

// Bad - Unclear what data is included
class PlanRepository {
  constructor(private supabase: SupabaseClient) {}

  findById(id: string) {
    return this.supabase
      .from('plans')
      .from('plans')
      .select(`
        id, 
        title, 
        destination_name,
        plan_members (
          user_id, 
          tier
        ),
        plan_destinations (
          destinations (name, country)
        )
      `)
      .eq('id', id)
      .single();
  }

  findByIdForSharing(id: string) {
    return this.supabase
      .from('plans')
      .select(`
        id, 
        title, 
        destination_name,
        plan_members (
          user_id, 
          tier
        )
      `)
      .eq('id', id)
      .single();
  }
}
```

### Rule 3: Keep methods generic and reusable - avoid use-case-specific names

Repository methods should be general-purpose and describe what data they return, not how or where it's used. This promotes code reuse across different features.

```typescript
// Good - Generic, reusable methods
class PlanRepository {
  constructor(private supabase: SupabaseClient) {}

  findByOwnerIdIncludeMembers(ownerId: string) {
    return this.supabase
      .from('plans')
      .select(`
        id, 
        user_id, 
        title,
        plan_members (
          user_id, 
          tier
        )
      `)
      .eq('user_id', ownerId);
  }

  findByDateRangeIncludeDestinations(startDateIso: string, endDateIso: string) {
    return this.supabase
      .from('plans')
      .select(`
        id, 
        user_id, 
        title, 
        start_date, 
        end_date,
        plan_destinations (
          destinations (name, country)
        )
      `)
      .gte('start_date', startDateIso)
      .lte('end_date', endDateIso);
  }
}

// Bad - Use-case-specific method names
class PlanRepository {
  constructor(private supabase: SupabaseClient) {}

  findPlansForReporting(ownerId: string) {
    return this.supabase
      .from('plans')
      .select(`
        id, 
        user_id, 
        title,
        plan_members (
          user_id, 
          tier
        )
      `)
      .eq('user_id', ownerId);
  }

  findPlansForDashboard(startDateIso: string, endDateIso: string) {
    return this.supabase
      .from('plans')
      .select(`
        id, 
        user_id, 
        title, 
        start_date, 
        end_date,
        plan_destinations (
          destinations (name, country)
        )
      `)
      .gte('start_date', startDateIso)
      .lte('end_date', endDateIso);
  }
}
```

### Rule 4: No business logic in repositories

Repositories should only handle data access. Business logic, validations, and complex transformations belong in the Service layer.

```typescript
// Good - Repository only handles data access
class PlanRepository {
  constructor(private supabase: SupabaseClient) {}

  findByIdIncludeDestinations(id: string) {
    return this.supabase
      .from('plans')
      .select(`
        id, 
        user_id, 
        title,
        plan_destinations (
          destinations (name, country)
        )
      `)
      .eq('id', id)
      .single();
  }

  updateVisibility(id: string, isPublic: boolean) {
    return this.supabase
      .from('plans')
      .update({ is_public: isPublic })
      .eq('id', id)
      .select('id, is_public')
      .single();
  }
}

class PlanService {
  async publishPlan(planId: string) {
    const plan = await this.planRepository.findByIdIncludeDestinations(planId);

    if (!plan) {
      throw new Error('Plan not found');
    }

    if (!plan.plan_destinations?.length) {
      throw new Error('Add at least one destination before publishing');
    }

    // Business logic: announce the plan
    await this.notificationService.notifyPlanPublished(plan);

    // Update visibility through repository
    return this.planRepository.updateVisibility(planId, true);
  }
}

// Bad - Business logic in repository
class PlanRepository {
  constructor(private supabase: SupabaseClient) {}

  async publishPlan(planId: string) {
    const { data: plan } = await this.supabase
      .from('plans')
      .select(`
        id, 
        user_id, 
        title,
        plan_destinations (
          destinations (name, country)
        )
      `)
      .eq('id', planId)
      .single();

    if (!plan) {
      throw new Error('Plan not found');
    }

    if (!plan.plan_destinations?.length) {
      throw new Error('Add at least one destination before publishing');
    }

    // ❌ Business logic shouldn't be here
    await this.notificationService.notifyPlanPublished(plan);

    return this.supabase
      .from('plans')
      .update({ is_public: true })
      .eq('id', planId)
      .select('id, is_public')
      .single();
  }
}
```

### Summary

- Method names should be concise: `findById` not `findBookingById`
- Use `include`/`with` keywords when fetching relations: `findByIdIncludeHosts`
- Keep methods generic and reusable: `findByUserIdIncludeAttendees` not `findBookingsForReporting`
- No business logic in repositories - that belongs in Services
