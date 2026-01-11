# Cross-Client Mention Interoperability

## Overview

This document describes how Apollo implements mentions/invites for questions in a way that is compatible with other Nostr clients. The solution addresses the fundamental challenge that Apollo uses custom event kinds (`questionKind`) which other clients don't subscribe to.

## Problem Statement

### Original Implementation Issues

1. **Custom event kind**: Questions use `questionKind` (custom kind) which other clients don't subscribe to
2. **Non-standard tag format**: Apollo used `["p", pubkey, "", "mention"]` instead of standard `["p", pubkey]`
3. **No content mentions**: Mentions were stored only in tags, not in content as `nostr:npub1...` URIs

### Result

When User A invited User B to a question:
- **Apollo**: User B received a notification ✓
- **Damus/Amethyst/Coracle**: User B saw nothing ✗

---

## Solution Architecture

### Two-Pronged Approach

```
┌─────────────────────────────────────────────────────────────────┐
│                    Question with Invites                         │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│  Part 1: Kind 1 Notes   │     │  Part 2: NIP-27 Format  │
│  (Cross-client visible) │     │  (Future-proof content) │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ Other clients see the   │     │ Clients that support    │
│ kind 1 notification     │     │ questionKind see inline │
│ with naddr link         │     │ mentions in content     │
└─────────────────────────┘     └─────────────────────────┘
```

---

## Part 1: Kind 1 Invite Notes

### Purpose

Publish a standard kind 1 note (which all Nostr clients subscribe to) that notifies the invited user and contains a link back to the question.

### Event Structure

```json
{
  "kind": 1,
  "content": "I invited you to answer my question on Apollo:\n\nhttps://apollo.example.com/questions/{id}\n\nnostr:naddr1...",
  "tags": [
    ["p", "<invited_user_pubkey>"],
    ["a", "<questionKind>:<author_pubkey>:<question_id>"],
    ["r", "https://apollo.example.com/questions/{id}"],
    ["client", "Apollo"]
  ]
}
```

### Tag Breakdown

| Tag | Purpose |
|-----|---------|
| `["p", pubkey]` | Tags the invited user (triggers notification in their client) |
| `["a", coordinate]` | Links to the question (allows Apollo to route back) |
| `["r", url]` | Web URL reference (NIP-standard for linking URLs) |
| `["client", "Apollo"]` | Identifies the source client |

### Implementation

**File**: `src/domains/question/hooks/useQuestionForm.ts`

```typescript
// After publishing the question
if (invitedUsers.length > 0 && auth.pubkey) {
    const questionNaddr = nip19.naddrEncode({
        kind: constants.questionKind as number,
        pubkey: auth.pubkey,
        identifier: questionId
    });
    const questionUrl = `${window.location.origin}/questions/${questionId}`;

    for (const user of invitedUsers) {
        try {
            await publishEvent(constants.noteKind,
                `I invited you to answer my question on Apollo:\n\n${questionUrl}\n\nnostr:${questionNaddr}`,
                [
                    ["p", user.pubkey],
                    ["a", `${constants.questionKind}:${auth.pubkey}:${questionId}`],
                    ["r", questionUrl],
                    ["client", "Apollo"]
                ]
            );
        } catch (inviteError) {
            console.warn('Failed to publish invite note:', inviteError);
        }
    }
}
```

---

## Part 2: NIP-27 Format in Question Content

### Purpose

Embed `nostr:npub1...` URIs in the question content itself, following the NIP-27 standard. This ensures:
1. Future clients supporting `questionKind` will see mentions inline
2. Content is self-describing (mentions visible even without tag parsing)

### Content Format

**Before (old)**:
```
This is my question about TypeScript generics...
```

**After (new)**:
```
This is my question about TypeScript generics...

**Invited:** nostr:npub1abc123... nostr:npub1def456...
```

### Tag Format Change

**Before (old)**:
```json
["p", "abc123...", "", "mention"]
```

**After (new)**:
```json
["p", "abc123..."]
```

The `"mention"` marker is no longer needed because:
1. NIP-27 `nostr:` URIs in content are the standard way to indicate mentions
2. Simpler tags are more interoperable

### Implementation

**File**: `src/domains/question/hooks/useQuestionForm.ts`

```typescript
let content = payload.description;

if (invitedUsers.length > 0) {
    const mentions = invitedUsers
        .map(u => `nostr:${nip19.npubEncode(u.pubkey)}`)
        .join(' ');
    content += `\n\n**Invited:** ${mentions}`;
}

await publishEvent(constants.questionKind, content, [
    ["d", payload.id!],
    ["title", payload.title],
    ...payload.tags.map(tag => ["t", tag]),
    ...invitedUsers.map(user => ["p", user.pubkey])  // Standard format
]);
```

---

## Backward Compatibility

### Reading Old Events

The transformers accept both old and new formats:

**Question Transformer** (`src/domains/question/services/question.transformer.ts`):
```typescript
const extractMentionedPubkeys = (eventTags: string[][], authorPubkey: string): string[] => {
    return eventTags
        .filter(tag => tag[0] === 'p' && tag[1] && tag[1] !== authorPubkey)
        .map(tag => tag[1])
        .filter(Boolean);
};
```

**Notification Transformer** (`src/domains/notification/services/notification.transformer.ts`):
```typescript
const isInvitedToQuestion = (event: NDKEvent, userPubkey: string): boolean => {
    if (event.pubkey === userPubkey) return false;
    return event.tags.some(
        tag => tag[0] === 'p' && tag[1] === userPubkey
    );
};
```

### Compatibility Matrix

| Event Format | Apollo Read | Apollo Notify | Other Clients |
|--------------|-------------|---------------|---------------|
| Old (`["p", pk, "", "mention"]`) | ✓ | ✓ | ✗ |
| New (`["p", pk]` + NIP-27) | ✓ | ✓ | ✓ (via kind 1) |

---

## Notification Flow

### Complete Flow Diagram

```
User A invites User B to a question
         │
         ├──────────────────────────────────────────────┐
         │                                              │
         ▼                                              ▼
┌─────────────────────────────┐          ┌─────────────────────────────┐
│ Publish questionKind event  │          │ Publish kind 1 invite note  │
│ Content: "Question..." +    │          │ Content: "I invited you..." │
│   "**Invited:** nostr:npub" │          │   + web URL + nostr:naddr   │
│ Tags: [["p", userB_pubkey]] │          │ Tags: [["p", userB_pubkey], │
└─────────────────────────────┘          │  ["a", coord], ["r", url]]  │
         │                               └─────────────────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────────────────┐          ┌─────────────────────────────┐
│ Apollo subscription         │          │ Other client subscription   │
│ (questionKind + "#p")       │          │ (kind 1 + "#p")             │
└─────────────────────────────┘          └─────────────────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────────────────┐          ┌─────────────────────────────┐
│ User B sees notification    │          │ User B sees notification    │
│ Type: MENTION               │          │ with web URL + naddr link   │
│ Links to: /questions/{id}   │          │ Clicking URL opens Apollo   │
└─────────────────────────────┘          └─────────────────────────────┘
```

### Apollo Notification Processing

Apollo's notification transformer handles both sources:

1. **questionKind events**: Detected via `isInvitedToQuestion()` → MENTION type
2. **kind 1 invite notes**: Detected via `isUserTagged()` + has `a` tag → MENTION type

---

## NIP Compliance

### NIPs Used

| NIP | Usage |
|-----|-------|
| **NIP-01** | Basic event structure, kind 1 notes |
| **NIP-19** | Bech32 encoding (`npub1...`, `naddr1...`) |
| **NIP-27** | `nostr:` URI scheme in content |
| **NIP-33** | Addressable events (questions use `d` tag) |

### NIP-27 Implementation

```typescript
import { nip19 } from "nostr-tools";

// Encode pubkey to npub for content
const npub = nip19.npubEncode(pubkey);
// => "npub1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqqqgd"

// Encode question reference
const naddr = nip19.naddrEncode({
    kind: constants.questionKind,
    pubkey: authorPubkey,
    identifier: questionId
});
// => "naddr1..."

// In content
const content = `nostr:${npub}`;  // Mention
const link = `nostr:${naddr}`;    // Question link
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/domains/question/hooks/useQuestionForm.ts` | Added NIP-27 content mentions, kind 1 invite notes |
| `src/domains/question/services/question.transformer.ts` | Updated to accept all p tags |
| `src/domains/notification/services/notification.transformer.ts` | Updated `isInvitedToQuestion` for both formats |

---

## Known Limitations

### 1. Duplicate Notifications

When User A invites User B, User B may receive TWO notifications in Apollo:
1. From the `questionKind` event (direct invite)
2. From the `kind 1` invite note

This is intentional redundancy - ensures the notification is seen even if one path fails.

### 2. Editing Questions

When editing a question and adding new invites:
- New users are added to content and tags ✓
- Kind 1 notes are published for all invited users (may re-notify existing invites)

### 3. Markdown Rendering

The `**Invited:**` uses markdown bold syntax:
- Clients with markdown support: Renders as "**Invited:**"
- Plain text clients: Shows raw `**Invited:**`

---

## Testing Checklist

- [ ] Create question with invited users
- [ ] Verify `questionKind` event has `nostr:npub1...` in content
- [ ] Verify kind 1 invite notes are published (one per invited user)
- [ ] Check notification appears in Damus/Amethyst/Coracle
- [ ] Click `naddr` link in other client → opens Apollo question page
- [ ] Verify Apollo shows mention notification for both old and new format questions
- [ ] Test with multiple invited users
- [ ] Test editing question and adding new invites
