# Notifications Architecture

## Overview

The notification system provides real-time notifications for Apollo users based on Nostr protocol events. Notifications are derived from events where the user is tagged via `#p` tags, transformed into a unified format, and displayed through UI components.

**Key Characteristics:**
- Real-time updates via IMMEDIATE subscription mode
- Q&A vs general Nostr activity differentiation
- Follow deduplication (kind 3 is replaceable)
- Memory-bounded storage (max 200 notifications)
- Persistent read state via localStorage

---

## Domain Structure

```
src/domains/notification/
├── types/
│   ├── notification.types.ts    # Type definitions, enums, constants
│   └── index.ts
├── services/
│   ├── notification.transformer.ts  # NDKEvent → Notification
│   └── index.ts
├── store/
│   ├── notification.slice.ts    # Redux state management
│   └── index.ts
├── hooks/
│   ├── useNotifications.ts      # Main subscription + data hook
│   ├── useNotificationSettings.ts  # Settings management
│   └── index.ts
├── components/
│   ├── NotificationBell.tsx     # Nav icon with badge
│   ├── NotificationDropdown.tsx # Dropdown panel
│   ├── NotificationItem.tsx     # Single notification row
│   ├── NotificationList.tsx     # Scrollable list
│   ├── NotificationEmptyState.tsx
│   └── index.ts
├── pages/
│   ├── NotificationsPage.tsx    # /notifications route
│   └── index.ts
└── index.ts
```

---

## Data Models

### NotificationType

```typescript
enum NotificationType {
    ANSWER = 'answer',           // Someone answered user's question
    COMMENT = 'comment',         // Someone commented on user's content
    ACCEPTED_ANSWER = 'accepted', // User's answer was accepted (future)
    MENTION = 'mention',         // User mentioned in content
    UPVOTE = 'upvote',           // Upvote on user's content
    DOWNVOTE = 'downvote',       // Downvote on user's content
    FOLLOW = 'follow',           // Someone followed user
    ZAP = 'zap'                  // Lightning zap received
}
```

### NotificationCategory

```typescript
enum NotificationCategory {
    QA = 'qa',              // ANSWER, COMMENT, ACCEPTED_ANSWER, MENTION
    ENGAGEMENT = 'engagement', // UPVOTE, DOWNVOTE
    SOCIAL = 'social',      // FOLLOW
    ZAPS = 'zaps'           // ZAP
}
```

### Notification

```typescript
interface Notification {
    id: string;                    // Event ID or "follow:{pubkey}"
    type: NotificationType;
    category: NotificationCategory;
    actors: NotificationActor[];   // Who triggered
    source: NotificationSource;    // What was interacted with
    createdAt: number;             // Unix timestamp
    zapAmount?: number;            // Sats (ZAP only)
    voteValue?: '+' | '-';         // Vote direction
    isQARelated: boolean;          // Apollo Q&A vs general Nostr
}
```

### NotificationSource

```typescript
interface NotificationSource {
    eventId: string;
    coordinate?: string;           // kind:pubkey:identifier
    resourceType: 'question' | 'answer' | 'comment';
    resourceId?: string;           // d-tag identifier
    preview?: string;              // Truncated content
}
```

---

## Nostr Protocol Integration

### Subscription Filter

```typescript
{
    kinds: [answerKind, voteKind, 1, 9735, 3],
    "#p": [userPubkey],
    limit: 100
}
```

### Event Kind Mapping

| Kind | Constant | Notification Type |
|------|----------|-------------------|
| `answerKind` | `constants.answerKind` | ANSWER |
| `voteKind` | `constants.voteKind` | UPVOTE / DOWNVOTE |
| `1` | `constants.noteKind` | COMMENT / MENTION |
| `9735` | `constants.zapReceiptKind` | ZAP |
| `3` | `constants.contactListKind` | FOLLOW |

### Q&A Relation Detection

A notification is `isQARelated: true` when:
1. Event's `a` tag references `questionKind` or `answerKind`
2. Type is `ANSWER` (always Q&A)
3. Kind is `voteKind` (Apollo-specific)

Non-Q&A notifications display a "Nostr" badge in the UI.

---

## Data Flow

```
Nostr Relay
    │
    ▼ NDKEvent
useNDKSubscription (IMMEDIATE mode)
    │
    ▼ NDKEvent
notificationTransformer
    │ - Skip own events
    │ - Verify user tagged
    │ - Determine type
    │ - Extract source
    │ - Detect Q&A relation
    ▼ Notification | null
notification.slice
    │ - Deduplicate
    │ - Sorted insert (binary search)
    │ - Prune (max 200)
    ▼ State update
useNotifications hook
    │ - Filter by settings
    │ - Calculate unread
    ▼ Props
UI Components
```

---

## Transformer

**Location:** `services/notification.transformer.ts`

### Input/Output
```typescript
notificationTransformer(event: NDKEvent, userPubkey: string): Notification | null
```

### Validation Steps
1. Skip if `event.pubkey === userPubkey` (no self-notifications)
2. Verify user in `#p` tags (except follows)
3. Determine type from kind + content
4. Extract source from `a` and `e` tags
5. Detect Q&A relation
6. Return `null` if invalid

### Type Determination Logic

```typescript
if (kind === zapReceiptKind) → ZAP
if (kind === answerKind) → ANSWER
if (kind === voteKind) → content === '+' ? UPVOTE : DOWNVOTE
if (kind === noteKind) {
    if (p-tag has "mention" marker) → MENTION
    if (user tagged) → COMMENT
}
if (kind === contactListKind) → FOLLOW
```

### Zap Amount Parsing

Extracts from bolt11 invoice in zap receipt:
```typescript
// Format: lnbc<amount><unit>...
// m = milli-BTC, u = micro-BTC, n = nano-BTC, p = pico-BTC
const match = bolt11.match(/lnbc(\d+)([munp]?)/i);
```

---

## Redux Slice

**Location:** `store/notification.slice.ts`

### State Shape

```typescript
interface NotificationState {
    byId: Record<string, Notification>;  // O(1) lookup
    ids: string[];                       // Sorted newest-first
    lastReadTimestamp: number;
    loading: boolean;
    initialized: boolean;
    settings: NotificationSettings;
    error: string | null;
}
```

### Key Algorithms

#### Sorted Insertion (Binary Search)
```typescript
// O(log n) find + O(n) splice
while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (byId[ids[mid]].createdAt > newNotification.createdAt) {
        low = mid + 1;
    } else {
        high = mid;
    }
}
result.splice(low, 0, newId);
```

#### Follow Deduplication
Kind 3 is replaceable - only latest per user kept:
```typescript
// ID format: "follow:{pubkey}" instead of event.id
if (payload.id.startsWith('follow:') && payload.createdAt > existing.createdAt) {
    state.byId[payload.id] = payload;
    // Re-sort since timestamp changed
}
```

#### Pruning
```typescript
const MAX_NOTIFICATIONS = 200;

if (ids.length > MAX_NOTIFICATIONS) {
    const prunedIds = ids.slice(0, MAX_NOTIFICATIONS);
    // Rebuild byId with only kept IDs
}
```

### Actions

| Action | Purpose |
|--------|---------|
| `addNotification` | Add single, sorted, deduplicated, pruned |
| `addNotifications` | Batch add with full re-sort |
| `markAllRead` | Set `lastReadTimestamp` to now |
| `markReadUntil` | Mark read up to timestamp |
| `clearNotifications` | Clear all |
| `updateSettings` | Update + persist settings |
| `toggleCategory` | Toggle category enabled |
| `setLoading` | Set loading state |
| `setInitialized` | Mark initial load complete |
| `setError` | Set error state |
| `resetNotifications` | Clear on logout |

---

## Hooks

### useNotifications

```typescript
interface UseNotificationsReturn {
    notifications: Notification[];       // Filtered by enabled categories
    unreadNotifications: Notification[];
    unreadCount: number;
    hasUnread: boolean;
    loading: boolean;
    initialized: boolean;
    markAllAsRead: () => void;
    markReadUpTo: (timestamp: number) => void;
    getByCategory: (category: NotificationCategory) => Notification[];
    error: string | null;
}
```

**Implementation:**
- Subscribes with `closeOnEose: false` for real-time
- Uses `EventHandlingMode.IMMEDIATE`
- Filters by `settings.enabled[category]`
- Unread = `createdAt > lastReadTimestamp`

**Key Methods:**
| Method | Description |
|--------|-------------|
| `markAllAsRead()` | Sets `lastReadTimestamp` to now |
| `markReadUpTo(timestamp)` | Sets `lastReadTimestamp` to given value |
| `markAsRead(notification)` | Marks notification + older as read |

### useNotificationSettings

```typescript
interface UseNotificationSettingsReturn {
    settings: NotificationSettings;
    setCategoryEnabled: (category, enabled) => void;
    toggleCategoryEnabled: (category) => void;
    toggleInApp: () => void;
    toggleAggregate: () => void;  // Future use
    resetSettings: () => void;
    isCategoryEnabled: (category) => boolean;
}
```

---

## Settings Behavior

### Category Filtering (`enabled[category]`)
- **Where applied:** `useNotifications.ts:70`
- **Effect:** Filters `notifications` array returned by hook
- **Impact:** Badge count, dropdown, and page all reflect only enabled categories

### Show In-App (`showInApp`)
- **Where applied:** `UserMenuDesktop.tsx:27`
- **Effect:** `NotificationBell` is not mounted when `false`
- **Impact:** Completely hides notification UI; no subscription created
- **Why parent:** Checking in parent prevents unnecessary hook calls in `NotificationBell`

### Aggregate Similar (`aggregateSimilar`)
- **Status:** Defined but not yet implemented
- **UI:** Shown as disabled "Coming soon" toggle in settings
- **Future:** Will group similar notifications (e.g., "3 people upvoted")

---

## Read/Unread Behavior

### How It Works
- `lastReadTimestamp` stored in localStorage and Redux
- Notification is unread if `createdAt > lastReadTimestamp`
- Clicking a notification marks all notifications up to that timestamp as read

### User Actions
| Action | Effect |
|--------|--------|
| Click notification | Marks that notification + all older as read |
| Click "Mark all read" | Sets `lastReadTimestamp` to current time |
| Navigate to notification target | Same as click |

### Efficient isUnread Check
```typescript
// O(1) - Direct timestamp comparison
const isUnread = (createdAt: number) => createdAt > lastReadTimestamp;

// NOT O(n) - Avoid array search
// const isUnread = unreadNotifications.some(n => n.createdAt === createdAt);
```

---

## Persistence

### localStorage Keys

```typescript
NOTIFICATION_STORAGE_KEYS = {
    LAST_READ: 'apollo:notifications:lastRead',   // Unix timestamp string
    SETTINGS: 'apollo:notifications:settings'     // JSON
}
```

### Persisted Data

| Data | Storage | Lifetime |
|------|---------|----------|
| `lastReadTimestamp` | localStorage | Permanent |
| `settings` | localStorage | Permanent |
| `notifications` | Redux only | Session (rebuilt from relay) |

### Fallback
If localStorage unavailable: defaults apply, session-only persistence.

---

## UI Components

### NotificationBell
- Bell icon in navigation
- Badge: none (0), count (1-99), "99+" (100+)
- Click toggles dropdown

### NotificationDropdown
- Header: "Notifications" + "Mark all read"
- Scrollable list (max 400px, 10 items)
- Footer: "View all" link

### NotificationItem

| Type | Icon | Color |
|------|------|-------|
| ANSWER | MessageAdd01 | blue-500 |
| COMMENT | MessageAdd01 | slate-500 |
| ACCEPTED_ANSWER | CheckmarkCircle02 | green-500 |
| MENTION | At | purple-500 |
| UPVOTE | ThumbsUp | teal-500 |
| DOWNVOTE | ThumbsDown | red-500 |
| FOLLOW | UserAdd01 | indigo-500 |
| ZAP | Flash | amber-500 |

**Link Behavior:**
- Q&A + resourceId → `/questions/{resourceId}`
- Follow → `/user/{actorPubkey}`
- Non-Q&A → `#` (no navigation)

**Badges:**
- Unread: teal dot indicator
- Non-Q&A: "Nostr" badge

---

## Subscription Compliance

Per `architecture/subscriptions.md`:

| Aspect | Implementation |
|--------|----------------|
| Mode | `IMMEDIATE` (real-time badge) |
| Hook | `useNDKSubscription` |
| ResourceType | `NOTIFICATION` added to enum |
| closeOnEose | `false` |

**Not Modified:**
- `SubscriptionManager.ts`
- `subscription.slice.ts`
- `PendingEventsState`

---

## Integration Points

### Files Modified

| File | Change |
|------|--------|
| `src/app/store.ts` | Register `notificationReducer` |
| `src/lib/subscriptions/types.ts` | Add `NOTIFICATION` to ResourceType |
| `src/constants/index.ts` | Add `zapReceiptKind: 9735` |
| `src/shared/components/layout/MainNavigation.tsx` | Add NotificationBell |
| `src/app/router.tsx` | Add `/notifications` route |
| `src/domains/auth/store/auth.middleware.ts` | Dispatch `resetNotifications` on logout |

### Route
```typescript
{ path: "/notifications", element: withAuthRequired(<NotificationsPage />) }
```

---

## Edge Cases

| Case | Handling |
|------|----------|
| Not logged in | Hide NotificationBell |
| No notifications | NotificationEmptyState |
| Own events | Filtered in transformer |
| Duplicate events | Deduplicated by ID |
| Duplicate follows | Updated if newer timestamp |
| Category disabled | Filtered in hook |
| localStorage unavailable | In-memory fallback |
| Profile not loaded | "Someone" placeholder |
| Invalid event | Return null from transformer |
| 200+ notifications | Oldest pruned |

---

## Constants

All notification kinds in `src/constants/index.ts`:

```typescript
{
    answerKind: parseInt(import.meta.env.VITE_ANSWER_KIND),
    voteKind: parseInt(import.meta.env.VITE_VOTE_KIND),
    noteKind: 1,
    contactListKind: 3,
    zapReceiptKind: 9735
}
```
