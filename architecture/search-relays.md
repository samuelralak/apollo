# NIP-50 Search Relays

This document describes the search relay configuration for Apollo's user search functionality.

---

## Overview

NIP-50 defines the search capability for Nostr relays, enabling full-text search across events. However, **most relays do NOT support NIP-50**. For reliable profile/user search, Apollo connects to dedicated search-capable relays.

---

## The Problem

Standard Nostr relays like `relay.damus.io` or `nos.lol` typically:
- Ignore the `search` filter field entirely
- Return random/recent profiles instead of search results
- May hang indefinitely without responding

This means a filter like `{ kinds: [0], search: "jack" }` will not work on most relays.

---

## Solution: Dedicated Search Relays

Apollo uses dedicated search relays that implement NIP-50:

```typescript
// src/constants/index.ts
searchRelays: [
    'wss://relay.nostr.band',
    'wss://relay.noswhere.com'
]
```

---

## Verified NIP-50 Search Relays

### Free Relays

| Relay | URL | Notes |
|-------|-----|-------|
| **Nostr.Band** | `wss://relay.nostr.band` | Most reliable, full index, spam filtered |
| **Nostr.Band (unfiltered)** | `wss://relay.nostr.band/all` | No spam filter, includes bots |
| **relay.noswhere.com** | `wss://relay.noswhere.com` | Community relay, good availability |

### Paid Relays

| Relay | URL | Notes |
|-------|-----|-------|
| **nostr.wine** | `wss://nostr.wine` | Premium relay with search |
| **filter.nostr.wine** | `wss://filter.nostr.wine` | Aggregates all relays, requires NIP-42 auth |

---

## Relay Capabilities

### relay.nostr.band (Primary)

The recommended free search relay:

- **NIP-50**: Full-text search for notes and profiles
- **NIP-45**: COUNT verb for follower counts, likes, reposts
- **Coverage**: Indexes events from all known public relays
- **Spam Filter**: Yes (use `/all` endpoint to bypass)
- **Cost**: Free
- **Used by**: Snort, Iris, Amethyst, Primal

**Use Cases:**
- Search notes and profiles
- Get latest kind:0 (profile) or kind:3 (contacts) for a pubkey
- Accurate event counts

### filter.nostr.wine (Premium)

For paid nostr.wine members:

- **Requirement**: Paid nostr.wine subscription
- **Auth**: Client must support NIP-42 authentication
- **Coverage**: Real-time aggregation from:
  - relay.damus.io
  - nos.lol
  - relay.snort.social
  - nostr.mom
  - offchain.pub
  - relay.primal.net
  - And many more...

---

## NIP-50 Protocol

### Request Format

```json
["REQ", "subscription-id", {
  "kinds": [0],
  "search": "search query here",
  "limit": 10
}]
```

### Key Points

- `search` field contains human-readable query
- Relays interpret and return matching events
- Results should be sorted by relevance (descending)
- Clients should check `supported_nips` via NIP-11

### Checking Relay Support

Query relay info to check NIP-50 support:

```bash
curl -H "Accept: application/nostr+json" https://relay.nostr.band
```

Look for `50` in the `supported_nips` array.

---

## Implementation in Apollo

### Constants Configuration

```typescript
// src/constants/index.ts
const constants = {
    // ... other constants

    // Primary relays for general use
    explicitRelays: [
        'wss://relay.damus.io',
        'wss://nos.lol',
        'wss://relay.nostr.band'  // Also supports search
    ],

    // Dedicated search relays (NIP-50)
    searchRelays: [
        'wss://relay.nostr.band',
        'wss://relay.noswhere.com'
    ]
}
```

### UserSearch Component

The `UserSearch` component (`src/shared/components/forms/UserSearch.tsx`) uses search relays for:

1. **npub/nprofile lookup**: Direct user resolution (always works)
2. **Text search**: NIP-50 query to search relays

```typescript
// Simplified flow
if (query.startsWith('npub1') || query.startsWith('nprofile1')) {
    // Direct lookup - works on any relay
    const user = ndk.getUser({ npub: query })
    await user.fetchProfile()
} else {
    // NIP-50 search - requires search relay
    const events = await ndk.fetchEvents({
        kinds: [0],
        search: query,
        limit: 15
    })
}
```

---

## Best Practices

### 1. Always Support Direct Lookup

npub/nprofile lookup is more reliable than text search:

```typescript
if (query.startsWith('npub1')) {
    // This always works
    const user = ndk.getUser({ npub: query })
}
```

### 2. Add Timeouts

Search relays may be slow or unresponsive:

```typescript
const searchPromise = ndk.fetchEvents(filter)
const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), 5000)
)
await Promise.race([searchPromise, timeoutPromise])
```

### 3. Deduplicate Results

Multiple relays may return the same user:

```typescript
const uniqueUsers = new Map<string, NDKUser>()
for (const event of events) {
    if (!uniqueUsers.has(event.pubkey)) {
        uniqueUsers.set(event.pubkey, user)
    }
}
```

### 4. Handle Missing Search Relays

If no search relays are configured, guide users:

```typescript
if (users.length === 0 && !loading) {
    return "No users found. Try pasting an npub."
}
```

---

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Search returns nothing | Relay doesn't support NIP-50 | Use dedicated search relay |
| Search hangs | Relay ignores `search` field | Add timeout with Promise.race |
| Duplicate results | Multiple relays return same user | Deduplicate by pubkey |
| Case sensitivity | Some relays are case-sensitive | Normalize queries client-side |
| Slow results | Relay indexing lag | Query multiple search relays |

---

## Environment Configuration

Override search relays via environment variables:

```bash
# .env
VITE_SEARCH_RELAYS=wss://relay.nostr.band,wss://relay.noswhere.com
```

---

## Future Improvements

1. **Relay Health Monitoring**: Track which search relays are responsive
2. **Fallback Chain**: Try multiple search relays in sequence
3. **Caching**: Cache recent search results locally
4. **NIP-42 Auth**: Support paid search relays like filter.nostr.wine

---

## References

- [NIP-50 Specification](https://github.com/nostr-protocol/nips/blob/master/50.md)
- [Nostr.Band Relay](https://relay.nostr.band/index.html)
- [filter.nostr.wine Documentation](https://nostr-wine.github.io/filter-relay/)
- [Amethyst Relay Setup Guide](https://vitor.npub.pro/post/relay-setup/)
- [nostr.watch - Relay Discovery](https://nostr.watch/)
