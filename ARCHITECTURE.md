# Apollo Architecture

This document describes the Domain-Driven Design (DDD) architecture used in the Apollo project.

## Directory Structure

```
src/
├── lib/                          # Third-party integrations
│   ├── ndk/                      # NDK (Nostr Dev Kit) integration
│   │   └── NDKProvider.tsx       # NDK context provider
│   ├── storage/                  # LocalForage wrapper
│   │   └── index.ts
│   └── webln/                    # WebLN types
│       └── types.d.ts
│
├── domains/                      # Feature domains (vertical slices)
│   ├── question/
│   │   ├── types/                # Domain-specific types
│   │   │   └── question.types.ts
│   │   ├── services/             # Domain-specific services & transformers
│   │   │   └── question.transformer.ts
│   │   ├── schemas/              # Zod validation schemas
│   │   │   └── question.schema.ts
│   │   ├── store/                # Redux slice
│   │   │   └── question.slice.ts
│   │   ├── components/           # Domain-specific UI components
│   │   │   ├── QuestionForm.tsx
│   │   │   ├── QuestionsList.tsx
│   │   │   ├── QuestionStats.tsx
│   │   │   └── EmptyState.tsx
│   │   └── pages/                # Domain route pages
│   │       ├── HomePage.tsx
│   │       ├── QuestionPage.tsx
│   │       ├── EditQuestionPage.tsx
│   │       ├── NewQuestionPage.tsx
│   │       └── index.ts
│   ├── answer/
│   │   ├── types/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── store/
│   │   └── components/
│   │       ├── AnswersContainer.tsx
│   │       ├── AnswerItem.tsx
│   │       ├── YourAnswer.tsx
│   │       └── AcceptAnswer.tsx
│   ├── comment/
│   │   ├── types/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── store/
│   │   └── components/
│   │       ├── CommentList.tsx
│   │       └── PostCommentBox.tsx
│   ├── vote/
│   │   ├── types/
│   │   ├── services/
│   │   ├── store/
│   │   └── components/
│   │       └── Votes.tsx
│   ├── auth/
│   │   ├── store/
│   │   │   ├── auth.slice.ts
│   │   │   └── auth.middleware.ts
│   │   └── components/
│   │       ├── GetStarted.tsx
│   │       ├── UserMenuDesktop.tsx
│   │       ├── UserMenuMobile.tsx
│   │       ├── AuthRequired.tsx
│   │       └── withAuthRequired.tsx
│   └── user/
│       ├── schemas/
│       │   └── user-profile.schema.ts
│       ├── components/
│       │   └── EventOwner.tsx
│       └── pages/
│           ├── ProfilePage.tsx
│           ├── settings/
│           │   ├── SettingsPage.tsx
│           │   ├── UserProfileSettingsPage.tsx
│           │   ├── NetworkSettingsPage.tsx
│           │   ├── NotificationsSettingsPage.tsx
│           │   ├── SecuritySettingsPage.tsx
│           │   ├── TranslationSettingsPage.tsx
│           │   ├── AppearanceSettingsPage.tsx
│           │   └── index.ts
│           └── index.ts
│
├── shared/                       # Truly shared code
│   ├── theme/                    # Centralized theme system
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── tokens/
│   │   │   ├── colors.ts
│   │   │   └── index.ts
│   │   ├── css/
│   │   │   └── variables.css
│   │   ├── hooks/
│   │   │   └── useTheme.ts
│   │   └── components/
│   │       └── ThemeProvider.tsx
│   ├── types/                    # Shared types used across domains
│   │   ├── user.types.ts         # User, BaseResource
│   │   └── category.types.ts     # Category, Guideline
│   ├── schemas/                  # Cross-cutting schemas
│   │   └── zap.schema.ts         # Zap validation (works on any event)
│   ├── store/                    # Cross-cutting Redux slices
│   │   └── portal.slice.ts       # Modal/portal state management
│   ├── components/
│   │   ├── feedback/             # Loader, ToastProvider
│   │   ├── forms/                # SelectMenu
│   │   ├── layout/               # MainNavigation
│   │   ├── portal/               # ZapPortal, SharePortal
│   │   ├── ActionItems.tsx
│   │   ├── AvatarPlaceholder.tsx
│   │   └── SEOContainer.tsx
│   └── hooks/                    # useNDKSubscription
│
├── app/                          # Application setup
│   ├── store.ts                  # Redux store configuration
│   ├── router.tsx                # React Router configuration
│   └── Root.tsx                  # Root layout component
│
├── utils/                        # Pure utility functions
├── constants/                    # App constants (Nostr kinds, relays)
├── data/                         # Static data (categories, guidelines)
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

**Note:** Currently, relative imports are used throughout the codebase. Path aliases are available but optional.

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| **Types** | `[domain].types.ts` | `question.types.ts` |
| **Schemas** | `[domain].schema.ts` or `[name].schema.ts` | `question.schema.ts`, `user-profile.schema.ts` |
| **Slices** | `[domain].slice.ts` | `question.slice.ts` |
| **Middleware** | `[domain].middleware.ts` | `auth.middleware.ts` |
| **Transformers** | `[domain].transformer.ts` | `question.transformer.ts` |
| **Components** | `PascalCase.tsx` | `QuestionForm.tsx`, `AnswerItem.tsx` |
| **Hooks** | `use[Name].ts` | `useNDKSubscription.ts` |
| **Utilities** | `camelCase.ts` or `kebab-case.ts` | `formatDateTime.ts`, `md-editor.ts` |

### Exports

```typescript
// Types - use `export type` for type-only exports
export type { Question } from './question.types';

// Components - use default export
export default QuestionForm;

// Slices - export default reducer + named actions
export default questionSlice.reducer;
export const { addQuestion, updateLastFetched } = questionSlice.actions;

// Transformers - use named export
export const questionTransformer = (event: NDKEvent): Question => { ... };
```

### Import Style

```typescript
// ✅ Prefer: import type for type-only imports
import type { Question } from "../types/question.types";

// ✅ Use relative paths (current convention)
import Votes from "../../vote/components/Votes";

// ✅ Group imports: external → internal → relative
import { useSelector } from "react-redux";
import { NDKEvent } from "@nostr-dev-kit/ndk";

import { RootState } from "../../../app/store";
import constants from "../../../constants";

import type { Question } from "../types/question.types";
import QuestionForm from "./QuestionForm";
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
│   └── [domain].types.ts
├── services/             # Domain-specific services & transformers
│   └── [domain].transformer.ts
├── components/           # Domain-specific UI components
│   └── [Component].tsx
├── pages/                # Route pages for this domain (optional)
│   ├── [Feature]Page.tsx
│   └── index.ts
├── hooks/                # Domain-specific hooks (optional)
│   └── use[Domain].ts
├── schemas/              # Zod validation schemas (optional)
│   └── [domain].schema.ts
├── store/                # Redux slice (optional)
│   ├── [domain].slice.ts
│   └── [domain].middleware.ts  # Optional
└── index.ts              # Domain barrel export (optional)
```

**Note:** Only create folders that are needed. A minimal domain might just have `types/` and `components/`.

### Quick Decision Tree

```
Where does my new code go?
│
├─ Is it a new entity/feature with its own data model?
│  └─ YES → Create new domain in /domains/[name]/
│
├─ Is it a React component?
│  ├─ Used by only one domain? → /domains/[domain]/components/
│  ├─ Used by multiple domains? → /shared/components/
│  └─ A page/route? → /domains/[primary-domain]/pages/
│
├─ Is it a type/interface?
│  ├─ Domain-specific? → /domains/[domain]/types/
│  └─ Used across domains? → /shared/types/
│
├─ Is it a validation schema?
│  ├─ Domain-specific form? → /domains/[domain]/schemas/
│  └─ Cross-cutting (like zaps)? → /shared/schemas/
│
├─ Is it a Redux slice?
│  └─ → /domains/[domain]/store/
│
├─ Is it a hook?
│  ├─ Domain-specific? → /domains/[domain]/hooks/
│  └─ Reusable? → /shared/hooks/
│
├─ Is it a third-party wrapper/integration?
│  └─ → /lib/[library-name]/
│
└─ Is it a pure utility function?
   └─ → /utils/
```

### What Goes Where

| Type of Code | Location | Example |
|-------------|----------|---------|
| **Domain entity types** | `/domains/[domain]/types/` | `Question`, `Answer`, `Vote` |
| **Shared types** | `/shared/types/` | `User`, `BaseResource`, `Category` |
| **Store types** | `/app/store.ts` | `RootState`, `AppDispatch` |
| **NDK event transformers** | `/domains/[domain]/services/` | `questionTransformer(event)` |
| **Redux slices** | `/domains/[domain]/store/` | `question.slice.ts` |
| **Redux middleware** | `/domains/[domain]/store/` | `auth.middleware.ts` |
| **Form validation** | `/domains/[domain]/schemas/` | `question.schema.ts` |
| **Cross-cutting schemas** | `/shared/schemas/` | `zap.schema.ts` |
| **Domain components** | `/domains/[domain]/components/` | `QuestionForm.tsx` |
| **Route pages** | `/domains/[domain]/pages/` | `QuestionPage.tsx`, `HomePage.tsx` |
| **Root layout** | `/app/Root.tsx` | `Root.tsx` (providers, layout) |
| **Domain hooks** | `/domains/[domain]/hooks/` | `useQuestions.ts` |
| **Shared components** | `/shared/components/` | `Loader.tsx`, `SelectMenu.tsx` |
| **Shared store (cross-cutting)** | `/shared/store/` | `portal.slice.ts` |
| **Shared hooks** | `/shared/hooks/` | `useNDKSubscription.ts` |
| **Third-party wrappers** | `/lib/` | `NDKProvider.tsx`, `storage/` |
| **Pure utilities** | `/utils/` | `formatDateTime.ts`, `classNames.ts` |
| **App constants** | `/constants/` | Nostr kinds, relay URLs |

### Shared Components Organization

Organize shared components by category:

| Category | Location | Examples |
|----------|----------|----------|
| **Feedback** | `/shared/components/feedback/` | `Loader.tsx`, `ToastProvider.tsx` |
| **Forms** | `/shared/components/forms/` | `SelectMenu.tsx` |
| **Layout** | `/shared/components/layout/` | `MainNavigation.tsx` |
| **Portal/Modals** | `/shared/components/portal/` | `ZapPortal.tsx`, `SharePortal.tsx` |
| **Generic** | `/shared/components/` (root) | `ActionItems.tsx`, `SEOContainer.tsx` |

**Rule:** If 3+ components share a category, create a subfolder.

### Page Organization

Pages (route components) live in their primary domain's `pages/` folder:

| Page | Primary Domain | Location |
|------|---------------|----------|
| Home (question list) | `question` | `domains/question/pages/HomePage.tsx` |
| Question detail | `question` | `domains/question/pages/QuestionPage.tsx` |
| New question | `question` | `domains/question/pages/NewQuestionPage.tsx` |
| User profile | `user` | `domains/user/pages/ProfilePage.tsx` |
| Settings | `user` | `domains/user/pages/settings/SettingsPage.tsx` |

**Page naming:** `[Feature]Page.tsx` (e.g., `QuestionPage.tsx`, `HomePage.tsx`)

**Root layout:** The app shell (providers, navigation) lives at `/app/Root.tsx`

**Router:** Routes are defined in `/app/router.tsx` and import from domain pages

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
# 1. Create domain structure (only what you need)
mkdir -p src/domains/bookmark/{types,services,components,store}
```

```typescript
// 2. Create types first
// src/domains/bookmark/types/bookmark.types.ts
import type { User } from "../../../shared/types/user.types";

export interface Bookmark {
    id: string;
    eventId: string;
    questionId: string;
    createdAt: number;
    user: User;
}
```

```typescript
// 3. Create transformer
// src/domains/bookmark/services/bookmark.transformer.ts
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { tagFromEvents } from "../../../utils";
import type { Bookmark } from "../types/bookmark.types";

export const bookmarkTransformer = (event: NDKEvent): Bookmark => {
    const tags = tagFromEvents(event.tags);
    return {
        id: tags['d']?.[0],
        eventId: event.id,
        questionId: tags['e']?.[0] ?? '',
        createdAt: event.created_at,
        user: { pubkey: event.pubkey }
    };
};
```

```typescript
// 4. Create Redux slice
// src/domains/bookmark/store/bookmark.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Bookmark } from "../types/bookmark.types";

interface BookmarkState {
    data: { [key: string]: Bookmark };
}

const bookmarkSlice = createSlice({
    name: 'bookmark',
    initialState: { data: {} } as BookmarkState,
    reducers: {
        addBookmark: (state, { payload }: PayloadAction<Bookmark>) => {
            state.data[payload.id] = payload;
        },
        removeBookmark: (state, { payload }: PayloadAction<string>) => {
            delete state.data[payload];
        }
    }
});

export const { addBookmark, removeBookmark } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
```

```typescript
// 5. Register in app/store.ts
import bookmarkReducer from "../domains/bookmark/store/bookmark.slice";

export const rootReducer = combineReducers({
    // ... existing reducers
    bookmark: bookmarkReducer,
});
```

```typescript
// 6. Create component
// src/domains/bookmark/components/BookmarkButton.tsx
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { addBookmark, removeBookmark } from "../store/bookmark.slice";

const BookmarkButton = ({ questionId }: { questionId: string }) => {
    // ... implementation
};

export default BookmarkButton;
```

---

## Common Mistakes to Avoid

### ❌ Don't: Import domain types/services across domains
```typescript
// domains/answer/components/AnswerItem.tsx
import type { Question } from "../../question/types/question.types"; // ❌ BAD
```

### ✅ Do: Pass data as props or use shared types
```typescript
// domains/answer/components/AnswerItem.tsx
interface Props {
    questionId: string;  // ✅ Just the ID
    questionPubkey: string;  // ✅ Only what's needed
}
```

### ❌ Don't: Create circular dependencies
```typescript
// domains/question/components/QuestionItem.tsx
import AnswersList from "../../answer/components/AnswersList";
// AND
// domains/answer/components/AnswersList.tsx
import QuestionItem from "../../question/components/QuestionItem"; // ❌ CIRCULAR
```

### ✅ Do: Keep component imports one-directional
```typescript
// Parent domain imports child domain's components
// domains/question/components/QuestionDetail.tsx
import AnswersContainer from "../../answer/components/AnswersContainer"; // ✅ OK

// Child never imports parent
// domains/answer/components/AnswersContainer.tsx
// Does NOT import from question/components/  // ✅ CORRECT
```

### ❌ Don't: Put reusable components in a domain
```typescript
// domains/question/components/Loader.tsx  // ❌ Should be in shared/
```

### ✅ Do: If 2+ domains need it, move to shared
```typescript
// shared/components/feedback/Loader.tsx  // ✅ CORRECT
```

---

## Cross-Domain Dependencies

### Allowed

- Domain → Shared (types, components, hooks)
- Domain → Lib (NDK, storage)
- Domain → Utils
- Domain → Constants
- Domain → Domain **for components only** (see rules below)
- Shared → Lib
- Shared → Utils

### Domain-to-Domain Component Imports

Domain components MAY import from other domain components when:
1. The imported component is a leaf/presentational component (e.g., `Votes`, `EventOwner`)
2. The relationship is natural (e.g., `AnswerItem` displaying `Votes`)
3. It avoids circular dependencies

**Examples of acceptable cross-domain imports:**
```typescript
// domains/answer/components/AnswerItem.tsx
import Votes from "../../vote/components/Votes";           // ✅ OK - presentational
import EventOwner from "../../user/components/EventOwner"; // ✅ OK - presentational
import CommentsList from "../../comment/components/CommentList"; // ✅ OK - leaf component
```

**NOT acceptable:**
```typescript
// domains/vote/components/Votes.tsx
import AnswerItem from "../../answer/components/AnswerItem"; // ❌ Circular risk
```

### NOT Allowed

- Domain → Domain **for types, services, store, schemas** (use shared as intermediary)
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

## Theme System

Apollo includes a theme system that supports light and dark modes with system preference detection.

### Directory Structure

```
src/shared/theme/
├── index.ts              # Main exports
├── types.ts              # Theme type definitions
├── tokens/
│   ├── colors.ts         # Color token definitions (reference)
│   └── index.ts          # Token exports
├── css/
│   └── variables.css     # CSS custom properties (light + dark)
├── hooks/
│   └── useTheme.ts       # Theme context hook
└── components/
    ├── ThemeProvider.tsx # Theme context provider
    └── ThemeToggle.tsx   # Quick toggle button
```

### How It Works

The ThemeProvider manages theme state and applies the `dark` class to the `<html>` element. Tailwind v4 is configured with class-based dark mode via `@custom-variant dark` in `index.css`. Components use Tailwind's built-in `dark:` variant for dark mode styles.

### Settings

Users can configure their theme preference at `/settings/appearance`. The preference is persisted to localStorage and respects system preference when set to "System". A quick toggle is also available in the navigation bar.

---

## Dark Mode First Development

**IMPORTANT:** All components MUST be built with dark mode support from the start. Never add a color class without its `dark:` counterpart.

### The Golden Rule

```tsx
// ❌ NEVER do this
<div className="bg-white text-slate-900">

// ✅ ALWAYS do this
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
```

### Color Palette Reference

Apollo uses **Slate** for neutrals and **Teal** for brand/accent colors.

#### Backgrounds

| Usage | Light | Dark | Example |
|-------|-------|------|---------|
| Page background | `bg-white` | `dark:bg-slate-900` | Main app background |
| Elevated surface | `bg-white` | `dark:bg-slate-800` | Cards, modals, dropdowns |
| Secondary surface | `bg-slate-50` | `dark:bg-slate-800` | Sidebars, secondary areas |
| Tertiary/Input | `bg-slate-100` | `dark:bg-slate-800` | Input fields, code blocks |
| Hover state | `hover:bg-slate-100` | `dark:hover:bg-slate-800` | List items, buttons |
| Active state | `bg-slate-200` | `dark:bg-slate-700` | Selected items |

#### Text Colors

| Usage | Light | Dark | Example |
|-------|-------|------|---------|
| Primary text | `text-slate-900` | `dark:text-slate-100` | Headings, body text |
| Secondary text | `text-slate-700` | `dark:text-slate-200` | Subheadings |
| Tertiary text | `text-slate-600` | `dark:text-slate-300` | Labels, metadata |
| Muted text | `text-slate-500` | `dark:text-slate-400` | Placeholders, hints |
| Disabled text | `text-slate-400` | `dark:text-slate-500` | Disabled states |

#### Borders

| Usage | Light | Dark | Example |
|-------|-------|------|---------|
| Default border | `border-slate-200` | `dark:border-slate-700` | Cards, dividers |
| Strong border | `border-slate-300` | `dark:border-slate-600` | Input focus |
| Focus ring | `ring-teal-600` | `dark:ring-teal-500` | Focus states |

#### Brand Colors (Teal)

| Usage | Light | Dark | Example |
|-------|-------|------|---------|
| Primary button | `bg-teal-600` | `dark:bg-teal-500` | CTAs |
| Primary hover | `hover:bg-teal-700` | `dark:hover:bg-teal-400` | Button hover |
| Primary text | `text-teal-600` | `dark:text-teal-400` | Links, active states |
| Primary hover text | `hover:text-teal-700` | `dark:hover:text-teal-300` | Link hover |
| Light background | `bg-teal-50` | `dark:bg-teal-900/30` | Info boxes |
| Light border | `border-teal-100` | `dark:border-teal-800` | Info box borders |

#### Feedback Colors

| Type | Light Background | Dark Background | Light Text | Dark Text |
|------|-----------------|-----------------|------------|-----------|
| Success | `bg-green-50` | `dark:bg-green-900/30` | `text-green-700` | `dark:text-green-300` |
| Warning | `bg-yellow-50` | `dark:bg-yellow-900/30` | `text-yellow-700` | `dark:text-yellow-300` |
| Error | `bg-red-50` | `dark:bg-red-900/30` | `text-red-700` | `dark:text-red-300` |
| Info | `bg-blue-50` | `dark:bg-blue-900/30` | `text-blue-700` | `dark:text-blue-300` |

### Component Patterns

#### Buttons

```tsx
// Primary button
<button className="bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600">
  Submit
</button>

// Secondary/Ghost button
<button className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors">
  Cancel
</button>
```

#### Form Inputs

```tsx
<input
  className="block w-full rounded-lg border-0 py-3 px-3
    bg-slate-100 dark:bg-slate-800
    text-slate-900 dark:text-slate-100
    ring-2 ring-slate-200 dark:ring-slate-700
    placeholder:text-slate-400
    focus:bg-white dark:focus:bg-slate-700
    focus:ring-teal-600 dark:focus:ring-teal-500
    focus:outline-none"
  placeholder="Enter text..."
/>
```

#### Cards

```tsx
<div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 p-6">
  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Title</h3>
  <p className="text-slate-600 dark:text-slate-400 mt-2">Description text</p>
</div>
```

#### Dropdowns/Menus

```tsx
<div className="bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 rounded-lg">
  <a className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
    Menu item
  </a>
</div>
```

#### Alert/Notice Boxes

```tsx
// Warning
<div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-100 dark:border-yellow-800 p-4">
  <p className="text-yellow-700 dark:text-yellow-300">Warning message</p>
</div>

// Info (using brand color)
<div className="rounded-lg bg-teal-50 dark:bg-teal-900/30 border-2 border-teal-100 dark:border-teal-800 p-4">
  <p className="text-slate-700 dark:text-slate-300">Info message</p>
</div>
```

#### Links

```tsx
<a className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline">
  Click here
</a>
```

#### Dividers

```tsx
<div className="border-t border-slate-200 dark:border-slate-700" />
```

#### Avatar Placeholders

```tsx
<span className="inline-block h-10 w-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
  <svg className="h-full w-full text-slate-300 dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>
</span>
```

### Component Checklist

Before submitting any component, verify:

- [ ] **All background colors** have `dark:` variants
- [ ] **All text colors** have `dark:` variants
- [ ] **All border colors** have `dark:` variants
- [ ] **All ring/outline colors** have `dark:` variants
- [ ] **Hover states** have `dark:hover:` variants
- [ ] **Focus states** have `dark:focus:` variants
- [ ] **Disabled states** have `dark:disabled:` variants
- [ ] **No hardcoded colors** in inline styles (use CSS variables or Tailwind)
- [ ] **No `gray-*` classes** - use `slate-*` instead for consistency
- [ ] **Shadows** account for dark mode (use `dark:shadow-slate-900/50` or similar)

### Common Mistakes

```tsx
// ❌ Using gray instead of slate
<p className="text-gray-500">  // Wrong!
<p className="text-slate-500 dark:text-slate-400">  // Correct!

// ❌ Forgetting hover dark variant
<a className="hover:text-slate-700">  // Missing dark hover!
<a className="hover:text-slate-700 dark:hover:text-slate-200">  // Correct!

// ❌ Hardcoded colors in style prop
<div style={{ backgroundColor: '#ffffff' }}>  // Won't respond to dark mode!
<div className="bg-white dark:bg-slate-900">  // Correct!

// ❌ Missing focus ring dark variant
<input className="focus:ring-teal-600">  // Missing dark variant!
<input className="focus:ring-teal-600 dark:focus:ring-teal-500">  // Correct!

// ❌ Inconsistent disabled states
<button disabled className="disabled:bg-gray-400">  // Wrong color + missing dark!
<button disabled className="disabled:bg-slate-400 dark:disabled:bg-slate-600">  // Correct!
```

### Testing Dark Mode

1. Use the theme toggle in the navigation bar to switch between modes
2. Test both modes before committing any UI changes
3. Check for contrast issues - text should be readable in both modes
4. Verify hover/focus states work correctly in both modes

### CSS Variables (Advanced)

For complex components that need programmatic color access, CSS variables are defined in `src/shared/theme/css/variables.css`:

```css
:root {
  --color-bg-primary: #ffffff;
  --color-text-primary: #0f172a;
  --color-border-default: #e2e8f0;
  /* ... */
}

.dark {
  --color-bg-primary: #0f172a;
  --color-text-primary: #f8fafc;
  --color-border-default: #334155;
  /* ... */
}
```

Use in CSS:
```css
.my-component {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}
```

### MDEditor Dark Mode

The MDEditor component automatically adapts to dark mode via CSS variables defined in `index.css`. No additional configuration needed when using the editor.

---

## Migration Complete

The codebase migration to Domain-Driven Design is complete. All legacy folders have been removed:

- ~~`src/components/`~~ → Components moved to `src/domains/*/components/` and `src/shared/components/`
- ~~`src/features/`~~ → Redux slices moved to `src/domains/*/store/`
- ~~`src/resources/`~~ → Types moved to `src/domains/*/types/` and `src/shared/types/`
- ~~`src/schemas/`~~ → Schemas moved to `src/domains/*/schemas/` and `src/shared/schemas/`
- ~~`src/hooks/`~~ → Hooks moved to `src/shared/hooks/`
- ~~`src/store/`~~ → Store configuration moved to `src/app/store.ts`
- ~~`src/storage/`~~ → Storage utilities moved to `src/lib/storage/`
- ~~`src/pages/`~~ → Pages moved to `src/domains/*/pages/` and `src/app/Root.tsx`

All imports now use the new domain-based paths.
