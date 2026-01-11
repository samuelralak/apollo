# NIP-02 Follows Architecture

This document describes the follow/follower system for Apollo, implementing NIP-02 Contact Lists.

---

## Overview

Apollo implements NIP-02 compliant follows using **kind 3** (Contact List). This allows users to follow other users and view follower/following lists on profiles.

**Key Concepts**:
- **Follow List (kind 3)**: A single replaceable event per user containing ALL followed pubkeys
- **Followers Query**: Query all kind 3 events that contain a specific pubkey in their `p` tags
- **Following Query**: Query a user's kind 3 event and extract the `p` tags

---

## NIP-02 Protocol

### Event Structure

```json
{
  "kind": 3,
  "pubkey": "<user-pubkey>",
  "content": "",
  "tags": [
    ["p", "<followed-pubkey-1>", "<relay-url?>", "<petname?>"],
    ["p", "<followed-pubkey-2>", "<relay-url?>", "<petname?>"],
    ...
  ]
}
```

### Key Points

| Aspect | Details |
|--------|---------|
| **Kind** | 3 (replaceable event) |
| **Content** | Empty string (or relay recommendations JSON) |
| **p tags** | One per followed user: `["p", pubkey, relay?, petname?]` |
| **Pubkey format** | 64-character lowercase hex string |

### Replaceable Event Semantics

- Each user has exactly ONE kind 3 event
- Publishing a new event REPLACES the previous one
- Relays keep only the event with the highest `created_at`
- Race conditions: latest timestamp wins

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Component Layer                               │
├─────────────────────────────────────────────────────────────────────┤
│                          ProfilePage                                 │
│         ┌────────────────────┼────────────────────┐                 │
│         │                    │                    │                 │
│   FollowButton         FollowersList        FollowingList           │
│         │                    │                    │                 │
│    useFollows()     (receives props)      (receives props)          │
└─────────────────────────────────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   useFollows    │  │useUserFollowers │  │useUserFollowing │
│  (current user) │  │ (any profile)   │  │  (any profile)  │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ • Follow/unfollow│ │ • Query #p tag  │  │ • Query authors │
│ • Optimistic UI │  │ • Returns list  │  │ • Returns list  │
│ • 300ms debounce│  │   of followers  │  │   of following  │
│ • Redux state   │  │ • Local state   │  │ • Local state   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     useNDKSubscription                               │
├─────────────────────────────────────────────────────────────────────┤
│  useFollows:        { kinds: [3], authors: [currentUserPubkey] }    │
│  useUserFollowers:  { kinds: [3], "#p": [profilePubkey] }           │
│  useUserFollowing:  { kinds: [3], authors: [profilePubkey] }        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                        [ Nostr Relays ]
```

---

## Domain Structure

```
src/domains/follow/
├── types/
│   ├── follow.types.ts       # FollowList, FollowState, FollowRef types
│   └── index.ts
├── services/
│   ├── follow.transformer.ts # Event transformation & tag builders
│   └── index.ts
├── store/
│   ├── follow.slice.ts       # Redux state for current user's follows
│   └── index.ts
├── hooks/
│   ├── useFollows.ts         # Current user's follow actions (write)
│   ├── useUserFollowers.ts   # Fetch who follows a user (read)
│   ├── useUserFollowing.ts   # Fetch who a user follows (read)
│   └── index.ts
├── components/
│   ├── FollowButton.tsx      # Follow/Unfollow toggle button
│   ├── FollowersList.tsx     # Display list of followers
│   ├── FollowingList.tsx     # Display list of following
│   └── index.ts
└── index.ts
```

---

## Three Hooks, Three Purposes

| Hook | Purpose | Filter | State Location |
|------|---------|--------|----------------|
| `useFollows` | Current user's follow actions | `{ kinds: [3], authors: [currentUser] }` | Redux |
| `useUserFollowers` | Who follows a profile | `{ kinds: [3], "#p": [profilePubkey] }` | Local (useState) |
| `useUserFollowing` | Who a profile follows | `{ kinds: [3], authors: [profilePubkey] }` | Local (useState) |

### Why Three Hooks?

1. **useFollows** - Needs Redux for:
   - Optimistic updates across all FollowButton instances
   - Pending operation tracking
   - Debounced publishing

2. **useUserFollowers/useUserFollowing** - Use local state because:
   - Read-only (no writes)
   - Profile-specific (different data per profile)
   - No need for cross-component sync

---

## Data Flow

### Follow a User

```
1. User clicks FollowButton on profile
   │
2. useFollows.follow(pubkey)
   │
3. Validation:
   │  ├─ Is logged in? (else show warning toast)
   │  ├─ Is valid pubkey? (else show error toast)
   │  ├─ Is not self? (else do nothing)
   │  └─ Not already following? (else do nothing)
   │
4. Optimistic update: dispatch(addFollowOptimistic(pubkey))
   │  └─► UI instantly shows "Following" state
   │
5. Cancel any pending debounce, start new 300ms timer
   │
6. After debounce: publishEvent(3, '', tags)
   │
   ├─► Success:
   │   ├─ Subscription receives confirmed event
   │   ├─ dispatch(setFollowList(newList))
   │   └─ Toast: "Now following"
   │
   └─► Failure:
       ├─ dispatch(revertFollowOperation({ pubkey, operation: 'add' }))
       └─ Toast: "Failed to follow"
```

### Unfollow a User

```
1. User clicks FollowButton (showing "Following")
   │
2. useFollows.unfollow(pubkey)
   │
3. Optimistic update: dispatch(removeFollowOptimistic(pubkey))
   │  └─► UI instantly shows "Follow" state
   │
4. Cancel pending debounce, start new 300ms timer
   │
5. After debounce: publishEvent(3, '', tagsWithoutPubkey)
   │
   ├─► Success: Toast "Unfollowed"
   └─► Failure: Revert + error toast
```

### Load Followers List (Profile Page)

```
1. User navigates to /user/:pubkey
   │
2. ProfilePage calls useUserFollowers(pubkey)
   │
3. useNDKSubscription subscribes to:
   │  { kinds: [3], "#p": [pubkey] }
   │
4. For each kind 3 event received:
   │  └─ Extract event.pubkey (the follower)
   │  └─ Add to followersMap (deduplicated)
   │
5. On EOSE: setInitialized(true), setLoading(false)
   │
6. FollowersList receives followersPubkeys as props
   │  └─ Renders paginated list (20 items initially)
```

### Load Following List (Profile Page)

```
1. ProfilePage calls useUserFollowing(pubkey)
   │
2. useNDKSubscription subscribes to:
   │  { kinds: [3], authors: [pubkey] }
   │
3. On kind 3 event received:
   │  └─ followListTransformer(event) → extract p tags
   │  └─ setFollowingPubkeys(list)
   │
4. On EOSE: setInitialized(true), setLoading(false)
   │
5. FollowingList receives followingPubkeys as props
```

---

## State Management

### Redux State (useFollows only)

```typescript
interface FollowState {
    list: {
        eventId: string;           // Current event ID
        pubkey: string;            // User's pubkey
        createdAt: number;         // Timestamp for conflict resolution
        followedPubkeys: string[]; // Array of followed pubkeys
    } | null;
    loading: boolean;
    pendingOperations: Record<string, 'add' | 'remove'>;
    initialized: boolean;
}
```

### Reducers

| Reducer | Purpose |
|---------|---------|
| `setFollowList` | Replace list from relay (newer timestamp wins) |
| `addFollowOptimistic` | Instant UI update before publish |
| `removeFollowOptimistic` | Instant UI update before publish |
| `revertFollowOperation` | Rollback on publish failure |
| `confirmFollowOperation` | Clear pending state |
| `setFollowInitialized` | Mark initial load complete |
| `clearFollows` | Reset state on logout |

### Local State (useUserFollowers/useUserFollowing)

These hooks use `useState` for profile-specific data:

```typescript
// useUserFollowers
const [followersMap, setFollowersMap] = useState<Map<string, boolean>>(new Map());

// useUserFollowing
const [followingPubkeys, setFollowingPubkeys] = useState<string[]>([]);
```

---

## Subscription Architecture

### Filter Patterns

| Hook | Filter | Returns |
|------|--------|---------|
| `useFollows` | `{ kinds: [3], authors: [currentUser] }` | Current user's follow list |
| `useUserFollowers` | `{ kinds: [3], "#p": [pubkey] }` | All kind 3 events tagging pubkey |
| `useUserFollowing` | `{ kinds: [3], authors: [pubkey] }` | The user's kind 3 event |

### Why IMMEDIATE Mode?

All follow subscriptions use `EventHandlingMode.IMMEDIATE` because:
- Follow state should update instantly in UI
- Not a feed (no "new followers available" banner)
- User's own data needs real-time sync

### Late Joiner Issue

**Problem**: When the same filter is used by multiple hook instances, later subscribers joining after EOSE miss historical events.

**Solution**: Hooks are called only at ProfilePage level, data passed to components as props:

```typescript
// ProfilePage.tsx
const { followersPubkeys, ... } = useUserFollowers(pubkey);
const { followingPubkeys, ... } = useUserFollowing(pubkey);

// Pass data down - don't call hooks in child components
<FollowersList followersPubkeys={followersPubkeys} ... />
<FollowingList followingPubkeys={followingPubkeys} ... />
```

---

## Components

### FollowButton

```typescript
interface FollowButtonProps {
    pubkey: string;           // User to follow/unfollow
    size?: 'sm' | 'md';       // Size variant
    className?: string;       // Additional styles
}
```

**States:**

| State | Text | Style | Behavior |
|-------|------|-------|----------|
| Not following | "Follow" | Filled teal | Click to follow |
| Following | "Following" | Outlined teal | Hover shows "Unfollow" |
| Hover on Following | "Unfollow" | Red background | Click to unfollow |
| Pending | "Loading..." | Disabled gray | Wait for operation |
| Own profile | Hidden | - | Can't follow yourself |
| Not logged in | Hidden | - | Must be authenticated |

### FollowersList / FollowingList

```typescript
interface FollowersListProps {
    followersPubkeys: string[];  // Data from parent hook
    loading: boolean;
    initialized: boolean;
}
```

**Features:**
- Pagination: Shows 20 items initially
- "Show more" button loads 20 more
- `startTransition` for non-blocking updates
- Loading skeleton while fetching
- Empty state when no data

---

## Toast Notifications

| Action | Toast |
|--------|-------|
| Follow success | `{ title: 'Now following', type: 'success' }` |
| Unfollow success | `{ title: 'Unfollowed', type: 'success' }` |
| Follow failed | `{ title: 'Failed to follow', subtitle: 'Please try again.', type: 'error' }` |
| Unfollow failed | `{ title: 'Failed to unfollow', subtitle: 'Please try again.', type: 'error' }` |
| Not logged in | `{ title: 'Sign in to follow', subtitle: '...', type: 'warning' }` |
| Invalid pubkey | `{ title: 'Invalid user', type: 'error' }` |

---

## Edge Cases

| Case | Handling |
|------|----------|
| **Not logged in** | FollowButton hidden; follow() shows warning toast |
| **Following yourself** | FollowButton hidden for own profile |
| **First follow** | Creates new list with single pubkey |
| **Rapid clicks** | 300ms debounce prevents relay spam |
| **Network failure** | Optimistic rollback + error toast |
| **Multiple devices** | Latest `created_at` wins (NIP-02 semantics) |
| **Logout** | `clearFollows()` dispatched via auth middleware |
| **Invalid pubkey** | Validated with `/^[0-9a-f]{64}$/i` regex |
| **Duplicate p tags** | Set-based O(1) deduplication in transformer |
| **Malformed profile JSON** | Safe parsing with try-catch in EventOwner |
| **Large follower counts** | Pagination (20 items) prevents render freeze |
| **Viewing own profile** | useUserFollowing returns Redux data (see Late Joiner Fix) |
| **Profile navigation** | Stale data check prevents flash of old data |

---

## Late Joiner Fix

### Problem

When viewing your own profile, both `useFollows` and `useUserFollowing` subscribe to the same filter:
```
{ kinds: [3], authors: [yourPubkey] }
```

The SubscriptionManager deduplicates by filter hash. If `useFollows` already received events and EOSE, `useUserFollowing` joins as a "late joiner" and never receives the historical events. Result: following count shows 0.

### Solution

`useUserFollowing` detects when viewing the current user's profile and returns data from Redux (already populated by `useFollows`) instead of creating a duplicate subscription:

```typescript
const isOwnProfile = pubkey && auth.isLoggedIn && pubkey === auth.pubkey;

// Disable subscription for own profile
const filters = useMemo(() => {
    if (!pubkey || isOwnProfile) return null;
    // ...
}, [pubkey, isOwnProfile]);

// Return Redux data for own profile
if (isOwnProfile) {
    return {
        followingPubkeys: followState.list?.followedPubkeys ?? [],
        count: followState.list?.followedPubkeys.length ?? 0,
        loading: followState.loading,
        initialized: followState.initialized
    };
}
```

### Stale Data Prevention

When navigating between profiles, effects run after render. This can cause a brief flash of old data. Both hooks track which pubkey their state belongs to:

```typescript
const [stateForPubkey, setStateForPubkey] = useState<string | undefined>(undefined);
const isStale = stateForPubkey !== pubkey;

// In event handlers:
setStateForPubkey(pubkey);

// In return:
if (isStale) {
    return { followingPubkeys: [], count: 0, loading: true, initialized: false };
}
```

This ensures old profile data is never shown for a new profile during the transition

---

## Integration Points

### Files Modified

| File | Change |
|------|--------|
| `src/app/store.ts` | Register `followReducer` |
| `src/lib/subscriptions/types.ts` | Add `FOLLOW` to `ResourceType` enum |
| `src/constants/index.ts` | Add `contactListKind: 3` |
| `src/domains/user/pages/ProfilePage.tsx` | Add tabs, sidebar counts, FollowButton |
| `src/domains/user/components/EventOwner.tsx` | Safe JSON parsing for profiles |
| `src/domains/auth/store/auth.middleware.ts` | Clear follows on logout |

### New Files

| File | Purpose |
|------|---------|
| `src/domains/follow/types/follow.types.ts` | Type definitions |
| `src/domains/follow/services/follow.transformer.ts` | Event transformation |
| `src/domains/follow/store/follow.slice.ts` | Redux slice |
| `src/domains/follow/hooks/useFollows.ts` | Current user's follow actions |
| `src/domains/follow/hooks/useUserFollowers.ts` | Fetch profile's followers |
| `src/domains/follow/hooks/useUserFollowing.ts` | Fetch profile's following |
| `src/domains/follow/components/FollowButton.tsx` | Toggle button |
| `src/domains/follow/components/FollowersList.tsx` | Followers display |
| `src/domains/follow/components/FollowingList.tsx` | Following display |

---

## Comparison with Bookmarks

| Aspect | Bookmarks (NIP-51) | Follows (NIP-02) |
|--------|-------------------|------------------|
| **Kind** | 10003 | 3 |
| **Tag type** | `a` (coordinates) | `p` (pubkeys) |
| **Tag format** | `["a", "30050:pubkey:id"]` | `["p", "pubkey", "relay?"]` |
| **Content** | Empty | Empty |
| **Replaceable** | Yes | Yes |
| **Optimistic updates** | Yes | Yes |
| **Debounce** | 300ms | 300ms |
| **Query for list** | By author | By author |
| **Query who bookmarked** | N/A | By `#p` tag |

---

## Performance Optimizations

| Optimization | Location | Benefit |
|--------------|----------|---------|
| **Set-based dedup** | `followListTransformer` | O(1) vs O(n) per item |
| **Pagination** | FollowersList/FollowingList | Only render 20 items initially |
| **startTransition** | "Show more" button | Non-blocking UI updates |
| **Memo components** | All list components | Prevent unnecessary re-renders |
| **useUpdateEffect** | State reset on pubkey change | Skip initial mount |
| **useUnmountEffect** | Timeout cleanup | Prevent memory leaks |
| **Stale data check** | useUserFollowers/useUserFollowing | Prevent flash of old profile data |
| **Redux reuse** | useUserFollowing (own profile) | Avoid duplicate subscription |

---

## Future Improvements

1. **Relay hints** - Store preferred relay URLs in p tags for better routing
2. **Petnames** - Allow users to set nicknames for followed users
3. **Follow recommendations** - Suggest users to follow based on network
4. **Mutual follows** - Highlight users who follow each other
5. **Follow notifications** - Notify when someone follows you
6. **Export/Import** - Export follow list for backup

---

## References

- [NIP-02: Follow List](https://github.com/nostr-protocol/nips/blob/master/02.md)
- [Apollo bookmarks.md](./bookmarks.md)
- [Apollo subscriptions.md](./subscriptions.md)
