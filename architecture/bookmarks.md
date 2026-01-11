# NIP-51 Bookmarks Architecture

This document describes the bookmark system for Apollo, implementing NIP-51 Lists for saving questions.

---

## Overview

Apollo implements NIP-51 compliant bookmarks using **kind 10003** (Bookmark List). This allows users to save questions for later reference, with real-time sync across devices via Nostr relays.

**Key Concept**: Unlike votes (where each vote is a separate event), bookmarks use a **single replaceable event per user** containing ALL bookmarks. Adding or removing a bookmark requires publishing a NEW event with the updated list.

---

## NIP-51 Protocol

### Event Structure

```json
{
  "kind": 10003,
  "pubkey": "<user-pubkey>",
  "content": "",
  "tags": [
    ["d", ""],
    ["a", "30050:<author-pubkey>:<question-id>"],
    ["a", "30050:<author-pubkey>:<question-id>"],
    ...
  ]
}
```

### Key Points

| Aspect | Details |
|--------|---------|
| **Kind** | 10003 (replaceable event) |
| **Content** | Empty string |
| **d tag** | Empty string (required for replaceable events) |
| **a tags** | Addressable event coordinates for bookmarked questions |
| **Coordinate Format** | `<kind>:<pubkey>:<identifier>` (e.g., `30050:abc123:uuid`) |

### Replaceable Event Semantics

- Each user has exactly ONE kind 10003 event
- Publishing a new event REPLACES the previous one
- Relays keep only the event with the highest `created_at`
- Race conditions: latest timestamp wins

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Component Layer                               │
├─────────────────────────────────────────────────────────────────────┤
│  QuestionListItemB      QuestionPage       BookmarksPage            │
│         │                    │                  │                    │
│         └────────────────────┴──────────────────┘                    │
│                              │                                       │
│                       BookmarkButton                                 │
│                              │                                       │
│                       useBookmarks()                                 │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Hook Layer                                   │
├─────────────────────────────────────────────────────────────────────┤
│  useBookmarks.ts                                                     │
│  ├─ Subscribe to user's kind 10003 via useNDKSubscription           │
│  ├─ Optimistic updates (instant UI)                                 │
│  ├─ 300ms debounce (handles rapid clicks)                           │
│  └─ Rollback on publish failure                                     │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Redux Layer                                   │
├─────────────────────────────────────────────────────────────────────┤
│  bookmark.slice.ts                                                   │
│  State: {                                                            │
│    list: { eventId, pubkey, createdAt, bookmarkedCoordinates[] }    │
│    loading: boolean                                                  │
│    pendingOperations: { [coord]: 'add' | 'remove' }                 │
│    initialized: boolean                                              │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Subscription Layer                              │
├─────────────────────────────────────────────────────────────────────┤
│  Filter: { kinds: [10003], authors: [userPubkey] }                  │
│  Mode: IMMEDIATE (bookmarks sync instantly)                          │
│  ResourceType: BOOKMARK                                              │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                        [ Nostr Relays ]
```

---

## Domain Structure

```
src/domains/bookmark/
├── types/
│   ├── bookmark.types.ts       # BookmarkList, BookmarkState types
│   └── index.ts
├── services/
│   ├── bookmark.transformer.ts # Event transformation & tag builders
│   └── index.ts
├── store/
│   ├── bookmark.slice.ts       # Redux state management
│   └── index.ts
├── hooks/
│   ├── useBookmarks.ts         # Main hook for bookmark operations
│   └── index.ts
├── components/
│   ├── BookmarkButton.tsx      # Toggle button component
│   └── index.ts
├── pages/
│   ├── BookmarksPage.tsx       # User's saved questions
│   └── index.ts
└── index.ts
```

---

## Data Flow

### Add Bookmark

```
1. User clicks BookmarkButton
   │
2. useBookmarks.addBookmark(questionId, questionPubkey)
   │
3. Optimistic update: dispatch(addBookmarkOptimistic(coord))
   │  └─► UI instantly shows bookmarked state (amber icon)
   │
4. Start 300ms debounce timer
   │  └─► Handles rapid toggle clicks
   │
5. Build new tags array: existing bookmarks + new bookmark
   │
6. After debounce: publishEvent(10003, '', tags)
   │
   ├─► Success:
   │   ├─ Subscription receives confirmed event
   │   ├─ dispatch(setBookmarkList(newList))
   │   └─ dispatch(showToast({ title: 'Bookmark saved', type: 'success' }))
   │
   └─► Failure:
       ├─ dispatch(revertBookmarkOperation({ coord, operation: 'add' }))
       └─ dispatch(showToast({ title: 'Failed to save', type: 'error' }))
```

### Remove Bookmark

```
1. User clicks BookmarkButton (on bookmarked question)
   │
2. useBookmarks.removeBookmark(questionId, questionPubkey)
   │
3. Optimistic update: dispatch(removeBookmarkOptimistic(coord))
   │  └─► UI instantly shows unbookmarked state (slate icon)
   │
4. Start 300ms debounce timer
   │
5. Build new tags array: existing bookmarks - removed bookmark
   │
6. After debounce: publishEvent(10003, '', tags)
   │
   ├─► Success: Toast "Bookmark removed"
   └─► Failure: Revert + error toast
```

### Initial Load (on login)

```
1. User logs in
   │
2. useBookmarks hook activates
   │
3. useNDKSubscription subscribes to:
   │  { kinds: [10003], authors: [userPubkey] }
   │
4. On event received:
   │  ├─ bookmarkListTransformer(event) → BookmarkList
   │  └─ dispatch(setBookmarkList(list))
   │
5. On EOSE: dispatch(setBookmarkInitialized())
   │
6. BookmarkButtons render with correct state
```

---

## State Management

### Redux State Shape

```typescript
interface BookmarkState {
    list: {
        eventId: string;              // Current event ID
        pubkey: string;               // User's pubkey
        createdAt: number;            // Timestamp for conflict resolution
        bookmarkedCoordinates: string[]; // Array of "30050:pubkey:id" strings
    } | null;
    loading: boolean;
    pendingOperations: Record<string, 'add' | 'remove'>;
    initialized: boolean;
}
```

### Reducers

| Reducer | Purpose |
|---------|---------|
| `setBookmarkList` | Replace list from relay event (newer timestamp wins) |
| `addBookmarkOptimistic` | Instant UI update before publish |
| `removeBookmarkOptimistic` | Instant UI update before publish |
| `revertBookmarkOperation` | Rollback on publish failure |
| `confirmBookmarkOperation` | Clear pending state after success |
| `setBookmarkInitialized` | Mark initial load complete |
| `clearBookmarks` | Reset state on logout |

---

## Subscription Architecture

### Why useNDKSubscription (not direct fetch)?

| Aspect | Explanation |
|--------|-------------|
| **Persistent** | Bookmark list should stay synced while logged in |
| **Real-time** | Changes from other devices sync immediately |
| **Pattern** | Same as votes, answers, comments |

### Why IMMEDIATE mode (not BUFFERED)?

| Aspect | Explanation |
|--------|-------------|
| **Instant sync** | Bookmarks should update in UI immediately |
| **User's own data** | Not a feed of external content |
| **No banner needed** | No "new bookmarks available" UI pattern |

### What we DO NOT modify

- `PendingEventsState` - No buffering bucket for bookmarks
- `subscription.slice.ts` - No switch case for BOOKMARK (IMMEDIATE mode only)

---

## Components

### BookmarkButton

```typescript
interface BookmarkButtonProps {
    questionId: string;      // Question identifier (d tag)
    questionPubkey: string;  // Question author's pubkey
    showLabel?: boolean;     // Show "Save"/"Saved" text
    size?: 'sm' | 'md';      // Icon size variant
}
```

**States:**
| State | Icon | Color | Behavior |
|-------|------|-------|----------|
| Unbookmarked | Outline | Slate | Click to add |
| Bookmarked | Solid | Amber | Click to remove |
| Pending | Pulse animation | - | Disabled |
| Not logged in | Hidden | - | Component returns null |

### BookmarksPage

Located at `/bookmarks` (requires authentication).

- Lists all bookmarked questions
- Fetches question data via subscription
- Empty state when no bookmarks
- Accessible from user menu (desktop & mobile)

---

## Toast Notifications

| Action | Toast |
|--------|-------|
| Bookmark added | `{ title: 'Bookmark saved', type: 'success' }` |
| Bookmark removed | `{ title: 'Bookmark removed', type: 'success' }` |
| Add failed | `{ title: 'Failed to save bookmark', subtitle: 'Please try again.', type: 'error' }` |
| Remove failed | `{ title: 'Failed to remove bookmark', subtitle: 'Please try again.', type: 'error' }` |
| Not logged in | `{ title: 'Sign in to bookmark', subtitle: '...', type: 'warning' }` |

---

## Edge Cases

| Case | Handling |
|------|----------|
| **Not logged in** | BookmarkButton hidden; hook shows warning toast |
| **First bookmark** | Creates new list with single coordinate |
| **Rapid clicks** | 300ms debounce prevents relay spam |
| **Network failure** | Optimistic rollback + error toast |
| **Multiple devices** | Latest `created_at` wins (NIP-51 semantics) |
| **Logout** | `clearBookmarks()` dispatched via auth middleware |
| **Large bookmark lists** | Array iteration is O(n); future optimization with Set |

---

## Integration Points

### Files Modified

| File | Change |
|------|--------|
| `src/app/store.ts` | Register `bookmarkReducer` |
| `src/lib/subscriptions/types.ts` | Add `BOOKMARK` to `ResourceType` enum |
| `src/constants/index.ts` | Add `bookmarkListKind: 10003` |
| `src/domains/question/components/QuestionListItemB.tsx` | Add BookmarkButton |
| `src/domains/question/pages/QuestionPage.tsx` | Add BookmarkButton with label |
| `src/app/router.tsx` | Add `/bookmarks` route |
| `src/domains/auth/components/UserMenuDesktop.tsx` | Add Bookmarks menu item |
| `src/domains/auth/components/UserMenuMobile.tsx` | Add Bookmarks menu item |
| `src/domains/auth/store/auth.middleware.ts` | Clear bookmarks on logout |

---

## Coordinate Format

Questions in Apollo are **addressable events** (kind 30050), so we use the `a` tag format:

```
a tag: "<kind>:<author-pubkey>:<d-tag-identifier>"

Example: "30050:abc123def456:550e8400-e29b-41d4-a716-446655440000"
         │       │              │
         │       │              └─ Question UUID (d tag)
         │       └─ Question author's pubkey
         └─ Question kind (30050)
```

### Helper Functions

```typescript
// Build coordinate from components
buildQuestionCoordinate(pubkey, questionId)
// → "30050:pubkey:questionId"

// Parse coordinate to components
parseBookmarkCoordinate("30050:pubkey:id")
// → { coordinate, kind: 30050, questionPubkey, questionId }

// Build tags for publishing
buildBookmarkTags(["30050:abc:123", "30050:def:456"])
// → [["d", ""], ["a", "30050:abc:123"], ["a", "30050:def:456"]]
```

---

## Comparison with Votes

| Aspect | Votes | Bookmarks |
|--------|-------|-----------|
| **Nostr kind** | Custom vote kind | 10003 (NIP-51) |
| **Event structure** | One event per vote | One event per user (list) |
| **Subscription filter** | By resource (`#a` tag) | By user (`authors`) |
| **Adding** | Publish new event | Publish replacement with updated list |
| **Removing** | N/A (can change vote) | Publish replacement without item |
| **Conflict resolution** | Latest event per pubkey+resource | Latest `created_at` per user |

---

## Future Improvements

1. **Categorized Bookmarks (NIP-51 kind 30001)** - Allow users to organize bookmarks into folders
2. **Bookmark Notes** - Add personal notes to bookmarks via `content` field
3. **Export/Import** - Export bookmark list as JSON or share as Nostr event
4. **Bookmark Count Display** - Show how many users bookmarked a question
5. **Offline Support** - Cache bookmarks locally for offline viewing

---

## References

- [NIP-51: Lists](https://github.com/nostr-protocol/nips/blob/master/51.md)
- [Apollo ARCHITECTURE.md](../ARCHITECTURE.md)
- [Apollo subscriptions.md](./subscriptions.md)
