# Apollo Architecture

This document describes the Domain-Driven Design (DDD) architecture used in the Apollo project.

## Directory Structure

```
src/
├── app/                          # Application setup
│   ├── store.ts                  # Redux store configuration
│   └── index.ts                  # Barrel export
│
├── lib/                          # Third-party integrations
│   ├── ndk/                      # NDK (Nostr Dev Kit) integration
│   │   ├── NDKProvider.tsx       # NDK context provider
│   │   └── index.ts
│   ├── storage/                  # LocalForage wrapper
│   │   └── index.ts
│   └── webln/                    # WebLN types
│       └── types.d.ts
│
├── domains/                      # Feature domains (vertical slices)
│   ├── question/
│   │   ├── types/                # Domain-specific types
│   │   │   ├── question.types.ts
│   │   │   └── index.ts
│   │   ├── services/             # Domain-specific services & transformers
│   │   │   ├── question.transformer.ts
│   │   │   └── index.ts
│   │   ├── schemas/              # Zod validation schemas
│   │   │   ├── question.schema.ts
│   │   │   └── index.ts
│   │   ├── store/                # Redux slice
│   │   │   ├── question.slice.ts
│   │   │   └── index.ts
│   │   ├── components/           # Domain-specific UI components
│   │   ├── pages/                # Route pages
│   │   ├── hooks/                # Domain-specific hooks
│   │   └── index.ts              # Barrel export
│   ├── answer/
│   ├── vote/
│   ├── auth/
│   ├── comment/
│   ├── portal/
│   └── index.ts
│
├── shared/                       # Truly shared code
│   ├── types/                    # Shared types used across domains
│   │   ├── user.types.ts         # User, BaseResource
│   │   ├── category.types.ts     # Category, Guideline
│   │   └── index.ts
│   ├── components/
│   │   └── feedback/             # Loader, ToastProvider
│   ├── hooks/                    # useNDKSubscription
│   └── index.ts
│
├── components/                   # Legacy components (being migrated)
├── features/                     # Legacy Redux slices (re-exports)
├── resources/                    # Legacy types (re-exports)
├── schemas/                      # Legacy schemas (re-exports)
├── pages/                        # Route pages
├── hooks/                        # Legacy hooks (re-exports)
├── store/                        # Legacy store (re-exports)
├── utils/                        # Pure utility functions
├── constants/                    # App constants (Nostr kinds, relays)
├── data/                         # Static data (categories, guidelines)
├── router/                       # React Router configuration
└── assets/                       # Static assets
```

## Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

```typescript
"@/app/*"      → "src/app/*"
"@/lib/*"      → "src/lib/*"
"@/domains/*"  → "src/domains/*"
"@/shared/*"   → "src/shared/*"
"@/utils/*"    → "src/utils/*"
"@/constants"  → "src/constants/index.ts"
```

---

## Architecture Guidelines

### When to Create a New Domain

Create a new domain in `/domains/` when:

1. **It has its own data model** - The feature has a distinct entity (e.g., Question, Answer, User)
2. **It has dedicated UI** - Multiple components that work together for this feature
3. **It has state management** - Needs its own Redux slice or significant local state
4. **It's a bounded context** - The feature has clear boundaries and responsibilities

**Examples of domains:**
- `question` - Questions entity with CRUD operations
- `answer` - Answers associated with questions
- `auth` - Authentication and authorization
- `vote` - Voting functionality
- `portal` - Modal/portal state management

**NOT a domain (put in `/shared` instead):**
- Generic UI components (buttons, modals, loaders)
- Utility hooks used across multiple domains
- Layout components (navigation, footer)
- Types used by multiple domains (User, BaseResource)

### Domain Structure Template

When creating a new domain, follow this structure:

```
domains/[domain-name]/
├── types/                # Domain-specific types
│   ├── [domain].types.ts
│   └── index.ts
├── services/             # Domain-specific services & transformers
│   ├── [domain].transformer.ts
│   ├── [domain].service.ts   # Optional: API/business logic
│   └── index.ts
├── components/           # Domain-specific UI components
│   ├── [Component].tsx
│   └── index.ts
├── pages/                # Route pages (if applicable)
│   ├── [Page]Page.tsx
│   └── index.ts
├── hooks/                # Domain-specific hooks
│   ├── use[Domain].ts
│   └── index.ts
├── schemas/              # Zod validation schemas
│   ├── [domain].schema.ts
│   └── index.ts
├── store/                # Redux slice
│   ├── [domain].slice.ts
│   └── index.ts
└── index.ts              # Domain barrel export
```

### What Goes Where

| Type of Code | Location | Example |
|-------------|----------|---------|
| **Domain entity types** | `/domains/[domain]/types/` | `Question`, `Answer`, `Vote` |
| **Shared types** | `/shared/types/` | `User`, `BaseResource`, `Category` |
| **Store types** | `/app/store.ts` | `RootState`, `AppDispatch` |
| **NDK event transformers** | `/domains/[domain]/services/` | `questionTransformer(event)` |
| **Redux slices** | `/domains/[domain]/store/` | `question.slice.ts` |
| **Form validation** | `/domains/[domain]/schemas/` | `question.schema.ts` |
| **Domain components** | `/domains/[domain]/components/` | `QuestionForm.tsx` |
| **Route pages** | `/domains/[domain]/pages/` | `QuestionPage.tsx` |
| **Domain hooks** | `/domains/[domain]/hooks/` | `useQuestions.ts` |
| **Shared components** | `/shared/components/` | `Loader.tsx`, `SelectMenu.tsx` |
| **Shared hooks** | `/shared/hooks/` | `useNDKSubscription.ts` |
| **Third-party wrappers** | `/lib/` | `NDKProvider.tsx`, `storage/` |
| **Pure utilities** | `/utils/` | `formatDateTime.ts`, `classNames.ts` |
| **App constants** | `/constants/` | Nostr kinds, relay URLs |

---

## Adding a New Feature

### Checklist

1. **Determine if it's a new domain or extends existing**
   - New entity type? → New domain
   - Extends existing entity? → Add to existing domain
   - Generic/reusable? → Add to `/shared`

2. **Create the domain structure** (if new domain)
   ```bash
   mkdir -p src/domains/[name]/{types,services,components,pages,hooks,schemas,store}
   ```

3. **Add types first**
   - Create `domains/[name]/types/[name].types.ts`
   - Create `domains/[name]/types/index.ts`

4. **Create service layer** (if needed)
   - Add `domains/[name]/services/[name].transformer.ts`
   - Add `domains/[name]/services/index.ts`

5. **Create Redux slice** (if needed)
   - Add `domains/[name]/store/[name].slice.ts`
   - Add `domains/[name]/store/index.ts`
   - Register reducer in `app/store.ts`

6. **Create components and pages**
   - Add to `domains/[name]/components/`
   - Add pages to `domains/[name]/pages/`
   - Register routes in `router/index.tsx`

7. **Create barrel exports**
   - Add `index.ts` to each subfolder
   - Add domain `index.ts`
   - Export from `domains/index.ts`

### Example: Adding a "Bookmark" Feature

```bash
# 1. Create domain structure
mkdir -p src/domains/bookmark/{types,services,components,store,hooks}

# 2. Create types
# src/domains/bookmark/types/bookmark.types.ts
export interface Bookmark {
    id: string;
    questionId: string;
    createdAt: number;
    pubkey: string;
}

# 3. Create transformer
# src/domains/bookmark/services/bookmark.transformer.ts

# 4. Create Redux slice
# src/domains/bookmark/store/bookmark.slice.ts

# 5. Register in store
# src/app/store.ts - add bookmarkReducer

# 6. Create barrel exports
# src/domains/bookmark/index.ts
```

---

## Cross-Domain Dependencies

### Allowed

- Domain → Shared (types, components, hooks)
- Domain → Lib (NDK, storage)
- Domain → Utils
- Domain → Constants
- Shared → Lib
- Shared → Utils

### NOT Allowed

- Domain → Domain (use shared services as intermediary if needed)
- Shared → Domain
- Lib → Domain
- Lib → Shared

---

## Patterns

### Transformer Pattern

Transformers convert NDK events to domain objects. They live in the domain's services folder:

```typescript
// domains/question/services/question.transformer.ts
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { tagFromEvents } from "../../../utils";
import type { Question } from "../types/question.types";

export const questionTransformer = (event: NDKEvent): Question => {
    const tags = tagFromEvents(event.tags);

    return {
        id: tags['d']?.[0],
        eventId: event.id,
        title: tags['title']?.[0] ?? '',
        description: event.content,
        category: tags['category']?.[0],
        tags: tags['t'] ?? [],
        createdAt: event.created_at,
        user: { pubkey: event.pubkey }
    };
};
```

### Barrel Export Pattern

Each domain/folder should have an `index.ts`:

```typescript
// domains/question/index.ts
export * from './types';
export * from './services';
export * from './store';
export * from './schemas';
```

```typescript
// domains/question/types/index.ts
export type { Question } from './question.types';
```

```typescript
// domains/question/store/index.ts
export {
    default as questionReducer,
    addQuestion,
    updateLastFetched,
    type QuestionState
} from './question.slice';
```

---

## Migration Notes

The codebase is in a transitional state. Legacy files in these folders re-export from their new locations:

- `src/components/` → Re-exports from `src/shared/components/` and `src/lib/`
- `src/features/` → Re-exports from `src/domains/*/store/`
- `src/resources/` → Re-exports from `src/domains/*/types/` and `src/shared/types/`
- `src/schemas/` → Re-exports from `src/domains/*/schemas/`
- `src/hooks/` → Re-exports from `src/shared/hooks/`
- `src/store/` → Re-exports from `src/app/`

Files marked with `// TODO: Update imports...` comments indicate re-export files that can be removed once all imports are updated.

### Completing the Migration

1. Update imports in components/pages to use new paths
2. Delete re-export files once imports are updated
3. Move remaining components to their appropriate domains
4. Delete empty legacy folders
