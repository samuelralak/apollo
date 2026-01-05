# Subscription Management Architecture

## Overview

This document describes Apollo's centralized subscription management system for handling Nostr events. The system addresses critical performance issues while enabling a Twitter-style "new events available" user experience.

---

## The Problem

### N+1 Subscription Problem

Before this system, each component that needed Nostr data created its own subscription:

```
HomePage → useNDKSubscription → NDK Subscription #1
QuestionItem #1 → useNDKSubscription → NDK Subscription #2
QuestionItem #2 → useNDKSubscription → NDK Subscription #3
QuestionItem #3 → useNDKSubscription → NDK Subscription #4
...
```

**Result**: A page with 10 questions would open 11+ subscriptions to relays, even when many shared identical filters.

### Memory Leaks

The original `useNDKSubscription` hook had several issues:
1. **Stale closures**: Callbacks referenced outdated state
2. **Missing cleanup**: Subscriptions weren't properly stopped on unmount
3. **No deduplication**: Same filter = duplicate work

### Poor UX for Real-time Updates

New events would immediately insert into the UI, causing:
- Content jumping while reading
- Loss of scroll position
- Jarring user experience

---

## The Solution

### Centralized Subscription Manager

A singleton manager that:
1. **Deduplicates subscriptions** via filter hashing
2. **Reference counts** shared subscriptions
3. **Supports two event handling modes**:
   - `IMMEDIATE`: Events dispatch directly (default)
   - `BUFFERED`: Events stored for user-triggered loading

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Component Layer                               │
├─────────────────────────────────────────────────────────────────────┤
│  HomePage          QuestionPage         ProfilePage                  │
│     │                   │                    │                       │
│     └───────────────────┴────────────────────┘                       │
│                         │                                            │
│                  useNDKSubscription                                  │
│                  usePendingQuestions                                 │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   SubscriptionManager (Singleton)                    │
├─────────────────────────────────────────────────────────────────────┤
│  • Filter hashing & normalization                                    │
│  • Reference counting                                                │
│  • Event deduplication (Set<string>)                                │
│  • IMMEDIATE/BUFFERED mode routing                                  │
│  • LRU cleanup (max 10,000 seen events)                             │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           NDK Layer                                  │
├─────────────────────────────────────────────────────────────────────┤
│  • Single subscription per unique filter                            │
│  • Relay connection pooling                                         │
│  • Event routing to SubscriptionManager                             │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
                    [ Nostr Relays ]
```

---

## Event Flow

### IMMEDIATE Mode (Default)

Used for: Answers, votes, comments - content that should appear instantly.

```
Relay → NDK → SubscriptionManager → Dedupe Check → Callback → Redux → UI
```

### BUFFERED Mode

Used for: Questions on HomePage after initial load.

```
Relay → NDK → SubscriptionManager → Dedupe Check → Buffer
                                                      │
                                         Redux (pending count)
                                                      │
                                    ┌─────────────────┴─────────────────┐
                                    │  "5 new questions available"      │
                                    │         [Click to load]           │
                                    └─────────────────┬─────────────────┘
                                                      │
                              User clicks ────────────┘
                                                      │
                                                      ▼
                              flushBufferedEvents() → Callback → Redux → UI
```

---

## Key Components

### 1. SubscriptionManager (`src/lib/subscriptions/SubscriptionManager.ts`)

The core singleton managing all subscriptions.

```typescript
// Get the singleton instance
const manager = SubscriptionManager.getInstance();

// Initialize (done in NDKProvider)
manager.initialize(ndk, dispatch);

// Subscribe
const handle = manager.subscribe({
    id: 'unique-id',
    filters: { kinds: [30050] },
    mode: EventHandlingMode.BUFFERED,
    resourceType: ResourceType.QUESTION,
    onEvent: (event) => { /* ... */ },
    onEose: () => { /* ... */ }
});

// Unsubscribe
handle.unsubscribe();

// Flush buffered events
manager.flushBufferedEvents(
    ResourceType.QUESTION,
    undefined,  // context
    (event) => { /* process each event */ }
);

// Get stats (for debugging)
const stats = manager.getStats();
// { activeSubscriptions: 3, totalSubscribers: 7, ... }
```

### 2. useNDKSubscription Hook (`src/shared/hooks/useNDKSubscription.ts`)

Refactored hook that delegates to SubscriptionManager.

```typescript
useNDKSubscription(
    filters,           // NDKFilter | NDKFilter[]
    onEvent,           // (event: NDKEvent) => void
    onEose,            // () => void
    {
        ndkOptions: { closeOnEose: false },
        mode: EventHandlingMode.BUFFERED,
        resourceType: ResourceType.QUESTION,
        context: { parentId: questionId },
        enabled: true
    }
);
```

**Key improvements**:
- Uses refs for stable callbacks (fixes stale closures)
- Memoizes filter hash for proper dependency tracking
- Proper cleanup on unmount

### 3. usePendingQuestions Hook (`src/shared/hooks/usePendingEvents.ts`)

Hook for the "new events available" UI pattern.

```typescript
const {
    count,        // Number of pending events
    hasPending,   // Boolean helper
    pendingIds,   // Array of event IDs
    loadPending,  // Function to load events
    dismissPending // Function to dismiss without loading
} = usePendingQuestions();

// Load pending events
loadPending((event) => {
    dispatch(addQuestion(questionTransformer(event)));
});
```

### 4. Redux Slice (`src/shared/store/subscription.slice.ts`)

Tracks pending events for UI display.

```typescript
// State shape
{
    pending: {
        questions: {
            ids: ['event-1', 'event-2'],
            count: 2,
            oldestTimestamp: 1704067200
        },
        answers: {
            [questionId]: { ids: [...], count: 3 }
        },
        votes: { ... },
        comments: { ... }
    }
}
```

---

## Filter Deduplication

Filters are normalized and hashed for deduplication:

```typescript
// These produce the same hash:
{ kinds: [2, 1], "#a": ["b", "a"] }
{ kinds: [1, 2], "#a": ["a", "b"] }
// → Both hash to: '[{"#a":["a","b"],"kinds":[1,2]}]'
```

**Result**: Multiple components with identical filters share one NDK subscription.

---

## Usage Examples

### HomePage with "New Questions" Banner

```tsx
const HomePage = () => {
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const { count, loadPending } = usePendingQuestions();

    const handleQuestionEvent = useCallback((event: NDKEvent) => {
        dispatch(addQuestion(questionTransformer(event)));
    }, [dispatch]);

    const handleEose = useCallback(() => {
        dispatch(updateLastFetched());
        setInitialLoadComplete(true);
    }, [dispatch]);

    // IMMEDIATE during load, BUFFERED after
    useNDKSubscription(
        { kinds: [30050] },
        handleQuestionEvent,
        handleEose,
        {
            mode: initialLoadComplete
                ? EventHandlingMode.BUFFERED
                : EventHandlingMode.IMMEDIATE,
            resourceType: ResourceType.QUESTION
        }
    );

    return (
        <div>
            <NewQuestionsBanner
                count={count}
                onLoad={loadPending}
                onLoadCallback={handleQuestionEvent}
            />
            <QuestionsList ... />
        </div>
    );
};
```

### Question Page with Immediate Answers

```tsx
const QuestionPage = () => {
    const handleAnswerEvent = useCallback((event: NDKEvent) => {
        dispatch(addAnswer(answerTransformer(event)));
    }, [dispatch]);

    // Answers appear immediately
    useNDKSubscription(
        { kinds: [30051], "#a": [questionCoordinate] },
        handleAnswerEvent,
        undefined,
        {
            mode: EventHandlingMode.IMMEDIATE,
            resourceType: ResourceType.ANSWER,
            context: { parentId: questionId }
        }
    );
};
```

---

## Performance Benefits

| Metric | Before | After |
|--------|--------|-------|
| Subscriptions per page | 9-15+ | 1-3 |
| Duplicate events | Common | Eliminated |
| Memory leaks | Present | Fixed |
| UX during updates | Jarring | Smooth |

---

## Configuration

Constants in `SubscriptionManager.ts`:

```typescript
EOSE_TIMEOUT_MS = 10000       // Fallback if EOSE never fires
MAX_SEEN_EVENTS = 10000       // LRU cleanup threshold
BUFFER_CLEANUP_INTERVAL_MS = 60000    // Stale buffer cleanup
STALE_EVENT_THRESHOLD_MS = 3600000    // 1 hour buffer TTL
```

---

## Debugging

### Get Manager Stats

```typescript
const manager = SubscriptionManager.getInstance();
console.log(manager.getStats());
// {
//   activeSubscriptions: 3,
//   totalSubscribers: 7,
//   uniqueFilters: 3,
//   seenEventsCount: 150,
//   pendingEventsCount: 5
// }
```

### Check Redux State

```typescript
const pending = useSelector(state => state.subscription.pending);
console.log(pending.questions);
// { ids: ['...'], count: 5, oldestTimestamp: 1704067200 }
```

---

## Migration Guide

### From Old useNDKSubscription

**Before:**
```typescript
useNDKSubscription(
    { kinds: [30050] },
    { closeOnEose: false },
    handleEvent,
    handleEose
);
```

**After:**
```typescript
useNDKSubscription(
    { kinds: [30050] },
    handleEvent,
    handleEose,
    {
        ndkOptions: { closeOnEose: false },
        mode: EventHandlingMode.IMMEDIATE,
        resourceType: ResourceType.QUESTION
    }
);
```

---

## Future Improvements

1. **Optimistic updates** for votes
2. **Buffered mode** for answers/comments if needed
3. **Connection status indicator** in UI
4. **Component memoization** for render optimization
5. **Relay health monitoring** and failover
