NIP-XX
======

Apollo Q&A Platform
---------------

`draft` `optional`

This specification proposes the structure for the Apollo Q&A platform within the NOSTR network, using dedicated custom event kinds for questions and answers. This approach is designed to foster a focused, community-driven knowledge exchange without interfering with existing clients that support standard kinds like kind 1.

## Related NIPs

This specification builds upon and references the following NIPs:

| NIP | Name | Usage in Apollo |
|-----|------|-----------------|
| [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) | Basic Protocol | Event structure, filters, tags |
| [NIP-09](https://github.com/nostr-protocol/nips/blob/master/09.md) | Event Deletion | Deleting questions, answers, edits |
| [NIP-22](https://github.com/nostr-protocol/nips/blob/master/22.md) | Comments | Discussions on questions and answers |
| [NIP-25](https://github.com/nostr-protocol/nips/blob/master/25.md) | Reactions | Upvotes/downvotes on Q&A content |
| [NIP-27](https://github.com/nostr-protocol/nips/blob/master/27.md) | Text Note References | `nostr:` links in content |
| [NIP-32](https://github.com/nostr-protocol/nips/blob/master/32.md) | Labeling | Status, categories, edit states |
| [NIP-51](https://github.com/nostr-protocol/nips/blob/master/51.md) | Lists | Bookmarking questions/answers |
| [NIP-56](https://github.com/nostr-protocol/nips/blob/master/56.md) | Reporting | Flagging inappropriate content |
| [NIP-57](https://github.com/nostr-protocol/nips/blob/master/57.md) | Lightning Zaps | Tipping answer authors |

---

## Event Kinds Overview

### Apollo-Specific Kinds

| Kind | Name | Type | Description |
|------|------|------|-------------|
| 31993 | Question | Parameterized Replaceable | Questions posted on Apollo |
| 32017 | Answer | Parameterized Replaceable | Answers to questions |
| 31995 | Suggested Edit | Parameterized Replaceable | Edit proposals for questions |
| 31996 | Bounty | Parameterized Replaceable | Incentives for answers |
| 31997 | Answer Request | Parameterized Replaceable | Request specific users to answer |

### Standard Kinds Used

| Kind | Name | NIP | Usage |
|------|------|-----|-------|
| 5 | Deletion | NIP-09 | Delete questions, answers, edits |
| 7 | Reaction | NIP-25 | Upvotes (+) and downvotes (-) |
| 1111 | Comment | NIP-22 | Discussions on Q&A content |
| 1984 | Report | NIP-56 | Flag inappropriate content |
| 9734 | Zap Request | NIP-57 | Request Lightning payment |
| 9735 | Zap Receipt | NIP-57 | Confirm Lightning payment |
| 30003 | Bookmark Set | NIP-51 | Save questions/answers |

---

## Question Event

This type of event is used for posting questions on the Apollo platform.

### Format

The format uses a parameterized replaceable event kind `31993`.

The `.content` is the detailed description of the question in **Markdown** format. Clients SHOULD render Markdown and MAY support a subset of HTML for backward compatibility.

### Tags

| Tag | Required | Description |
|-----|----------|-------------|
| `d` | Yes | Universally unique identifier (UUID) for the question |
| `title` | Yes | Concise title of the question |
| `t` | Yes (1+) | Topic tags for categorization |
| `L` | Yes | Label namespace per NIP-32 |
| `l` | Yes | Label value under namespace per NIP-32 |
| `p` | No | Invited users (can answer/edit locked questions) |
| `p` (coauthor) | No | Co-authors: `["p", "<pubkey>", "", "coauthor"]` |
| `version` | No | Version number for edit tracking |
| `replaces` | No | Coordinate of previous version |
| `edit-source` | No | Event ID of accepted edit that created this version |
| `close-reason` | No | Reason for closure (if status is `closed`) |
| `duplicate-of` | No | Coordinate of original question (if duplicate) |
| `has-duplicate` | No | Coordinate of duplicate (bidirectional linking) |
| `community-wiki` | No | `true` for collaborative editing mode |
| `contributors` | No | Pubkeys of wiki contributors |
| `e` | No | Accepted answer event ID |
| `a` | No | Accepted answer coordinate with marker `accepted_answer` |

### Question Status

Questions have a status indicated by NIP-32 labels with namespace `status`:

| Status | Description | Answering | Editing |
|--------|-------------|-----------|---------|
| `open` | Default state | Anyone | Anyone can suggest edits |
| `locked` | Restricted access | Only `p`-tagged users | Only `p`-tagged users can suggest |
| `closed` | Not accepting answers | No one | Author can edit to reopen |
| `archived` | Historical/resolved | No one | No one |

### Closing Reasons

When a question is closed, include a `close-reason` tag:

| Reason | Description | Required Action |
|--------|-------------|-----------------|
| `duplicate` | Already answered elsewhere | Include `duplicate-of` tag |
| `unclear` | Needs more detail | Author should clarify |
| `too-broad` | Too many possible answers | Author should narrow scope |
| `opinion-based` | Subjective answers expected | Author should rephrase for facts |
| `off-topic` | Not relevant to platform | Community-defined |

### Example: Open Question

```json
{
  "id": "<32-byte hex event id>",
  "pubkey": "<32-byte hex public key>",
  "created_at": <unix timestamp>,
  "kind": 31993,
  "content": "## Background\n\nI'm trying to understand how Lightning channels work...\n\n## Specific Question\n\nHow are channel balances tracked between peers?",
  "tags": [
    ["d", "<uuid>"],
    ["title", "How do Lightning channel balances work?"],
    ["L", "category"],
    ["l", "technical", "category"],
    ["L", "status"],
    ["l", "open", "status"],
    ["t", "lightning"],
    ["t", "bitcoin"],
    ["p", "<invited user pubkey>"],
    ["version", "1"]
  ]
}
```

### Example: Locked Question

```json
{
  "kind": 31993,
  "content": "<markdown description>",
  "tags": [
    ["d", "<uuid>"],
    ["title", "<title>"],
    ["L", "status"],
    ["l", "locked", "status"],
    ["p", "<invited expert 1>"],
    ["p", "<invited expert 2>"],
    ["p", "<coauthor pubkey>", "", "coauthor"]
  ]
}
```

### Example: Closed as Duplicate

```json
{
  "kind": 31993,
  "content": "<markdown description>",
  "tags": [
    ["d", "<uuid>"],
    ["title", "<title>"],
    ["L", "status"],
    ["l", "closed", "status"],
    ["close-reason", "duplicate"],
    ["duplicate-of", "31993:<original author>:<original d-tag>", "<relay hint>"]
  ]
}
```

### Example: With Accepted Answer

```json
{
  "kind": 31993,
  "tags": [
    ["d", "<uuid>"],
    ["title", "<title>"],
    ["L", "status"],
    ["l", "open", "status"],
    ["e", "<accepted answer event id>"],
    ["a", "32017:<answerer pubkey>:<answer d-tag>", "<relay hint>", "accepted_answer"]
  ]
}
```

---

## Answer Event

This event type is for posting answers to questions.

### Format

The format uses a parameterized replaceable event kind `32017`.

The `.content` is the answer in **Markdown** format.

### Tags

| Tag | Required | Description |
|-----|----------|-------------|
| `d` | Yes | UUID for the answer |
| `e` | Yes | Question event ID |
| `a` | Yes | Question coordinate: `31993:<author>:<d-tag>` |
| `bounty` | No | Bounty coordinate this answer is competing for |

### Example

```json
{
  "id": "<32-byte hex event id>",
  "pubkey": "<32-byte hex public key>",
  "created_at": <unix timestamp>,
  "kind": 32017,
  "content": "## Short Answer\n\nLightning channels track balances using commitment transactions...\n\n## Detailed Explanation\n\n...",
  "tags": [
    ["d", "<uuid>"],
    ["e", "<question event id>"],
    ["a", "31993:<question author>:<question d-tag>", "<relay hint>"]
  ]
}
```

---

## Suggested Edit Event

This event type is for proposing edits to questions. Only the original author can directly edit; all others must suggest edits.

### Format

The format uses a parameterized replaceable event kind `31995`.

The `.content` contains the **full proposed new content** for the question in Markdown. Clients compute diffs for display.

### Tags

| Tag | Required | Description |
|-----|----------|-------------|
| `d` | Yes | UUID for this edit suggestion |
| `a` | Yes | Target question coordinate |
| `e` | Yes | Target question event ID |
| `title` | If changed | Proposed new title |
| `summary` | Yes | Brief description of changes (for review UI) |
| `reason` | Yes | Justification for why this edit improves the question |
| `sections` | Recommended | Changed sections: `title`, `body`, `tags` (comma-separated) |
| `L` | Yes | Namespace `edit_status` |
| `l` | Yes | Status value |

### Edit Status Values

| Status | Description |
|--------|-------------|
| `pending` | Awaiting author review |
| `accepted` | Edit applied, editor became co-author |
| `rejected` | Edit was declined |
| `withdrawn` | Editor withdrew suggestion |

### Permission Model

| Question Status | Who Can Suggest Edits |
|-----------------|----------------------|
| `open` | Anyone |
| `locked` | Only `p`-tagged users and co-authors |
| `closed` | Only original author (to fix and reopen) |
| `archived` | No one |

### Example

```json
{
  "kind": 31995,
  "pubkey": "<editor pubkey>",
  "content": "## Background\n\nI'm trying to understand how Lightning channels work. Specifically:\n\n1. How are balances tracked?\n2. What happens on channel close?\n\n## Context\n\n...",
  "tags": [
    ["d", "<edit uuid>"],
    ["a", "31993:<question author>:<question d-tag>", "<relay hint>"],
    ["e", "<question event id>"],
    ["title", "How do Lightning channel balances work? (Updated)"],
    ["summary", "Added specific sub-questions and context section"],
    ["reason", "Original question was too broad; breaking into specific parts makes it easier to answer"],
    ["sections", "title,body"],
    ["L", "edit_status"],
    ["l", "pending", "edit_status"]
  ]
}
```

### Accepting an Edit

When the original author accepts an edit:

1. **Publish updated question** (kind 31993) with:
   - Content from the suggested edit
   - Editor added as co-author: `["p", "<editor>", "", "coauthor"]`
   - Version incremented: `["version", "2"]`
   - Edit reference: `["edit-source", "<edit event id>"]`

2. **Optionally update edit status** (kind 31995 with same `d` tag):
   - Change `l` tag to `accepted`

---

## Co-authorship

Co-authors are users whose suggested edits have been accepted.

### Tracking

```json
["p", "<pubkey>"]                                    // Invited user
["p", "<pubkey>", "", "coauthor"]                    // Co-author
["p", "<pubkey>", "", "coauthor", "<edit-event-id>"] // Co-author with edit reference
```

### Permissions

| Role | Direct Edit | Suggest Edit | Change Status | Accept Answers |
|------|-------------|--------------|---------------|----------------|
| Original Author | Yes | N/A | Yes | Yes |
| Co-author | No | Yes (any status) | No | No |
| `p`-tagged User | No | Yes (if not archived) | No | No |
| Others | No | Yes (if open only) | No | No |

---

## Edit History & Versioning

Since Nostr events are immutable, edit history is tracked via an event chain.

### Version Chain

```
Question v1 (original)
    ↓ ["replaces", ""]
Question v2 (after edit 1)
    ↓ ["replaces", "31993:<author>:<v1-event-id>"]
Question v3 (after edit 2)
    ↓ ["replaces", "31993:<author>:<v2-event-id>"]
```

### Version Tags

```json
["version", "3"],
["replaces", "31993:<author>:<previous-event-id>"],
["edit-source", "<edit-event-id>"]
```

### Reconstructing History

Clients reconstruct edit history by:
1. Fetching the current version
2. Following the `replaces` chain back to original
3. Computing and displaying diffs between versions

---

## Duplicate Question Handling

### Marking as Duplicate

On the duplicate question:
```json
["L", "status"],
["l", "closed", "status"],
["close-reason", "duplicate"],
["duplicate-of", "31993:<original author>:<original d-tag>", "<relay hint>"]
```

On the original question (optional bidirectional linking):
```json
["has-duplicate", "31993:<duplicate author>:<duplicate d-tag>", "<relay hint>"]
```

### Client Behavior

- Display banner: "This question already has an answer here: [link]"
- Redirect new answer attempts to the original question
- Optionally show combined answer count

---

## Bounty Event

Bounties incentivize answers using Lightning sats. For direct tipping without bounty structure, use NIP-57 Zaps.

### Format

The format uses a parameterized replaceable event kind `31996`.

The `.content` is an optional message describing what the bounty offerer seeks.

### Tags

| Tag | Required | Description |
|-----|----------|-------------|
| `d` | Yes | UUID for this bounty |
| `a` | Yes | Target question coordinate |
| `e` | Yes | Target question event ID |
| `amount` | Yes | Bounty value in millisatoshis |
| `lnurl` | Recommended | LNURL or Lightning address for escrow/payment |
| `duration` | No | Duration in seconds (default: 604800 = 7 days) |
| `min-wait` | No | Minimum wait before awarding (default: 86400 = 24h) |
| `L` | Yes | Namespace `bounty_status` |
| `l` | Yes | Status value |

### Bounty Status Values

| Status | Description |
|--------|-------------|
| `active` | Accepting answers |
| `awarding` | Period ended, selecting winner |
| `awarded` | Winner selected and paid |
| `expired` | No eligible answers |

### Example: Creating a Bounty

```json
{
  "kind": 31996,
  "pubkey": "<bounty offerer>",
  "content": "Looking for a detailed explanation with code examples",
  "tags": [
    ["d", "<bounty uuid>"],
    ["a", "31993:<question author>:<question d-tag>", "<relay hint>"],
    ["e", "<question event id>"],
    ["amount", "10000000"],
    ["lnurl", "lnurl1..."],
    ["duration", "604800"],
    ["min-wait", "86400"],
    ["L", "bounty_status"],
    ["l", "active", "bounty_status"]
  ]
}
```

### Example: Awarding a Bounty

```json
{
  "kind": 31996,
  "tags": [
    ["d", "<same bounty uuid>"],
    ["a", "31993:<question author>:<question d-tag>", "<relay hint>"],
    ["e", "<question event id>"],
    ["amount", "10000000"],
    ["L", "bounty_status"],
    ["l", "awarded", "bounty_status"],
    ["awarded-to", "32017:<winner>:<answer d-tag>"],
    ["winner", "<winner pubkey>"]
  ]
}
```

### Rules

1. Bounties SHOULD NOT be cancellable once created (escrow model)
2. Minimum 24-hour wait before awarding (allows time for answers)
3. If not awarded within duration, bounty expires
4. Multiple bounties MAY exist on the same question

---

## Answer Request Event

Answer requests allow users to request specific experts to answer.

### Format

The format uses a parameterized replaceable event kind `31997`.

The `.content` is an optional message explaining why you're requesting this user.

### Tags

| Tag | Required | Description |
|-----|----------|-------------|
| `d` | Yes | UUID for this request |
| `a` | Yes | Target question coordinate |
| `e` | Yes | Target question event ID |
| `p` | Yes | Requested expert's pubkey |
| `expertise` | No | Relevant topic/expertise area |

### Example

```json
{
  "kind": 31997,
  "pubkey": "<requester>",
  "content": "I've seen your work on Lightning routing, would love your perspective",
  "tags": [
    ["d", "<request uuid>"],
    ["a", "31993:<question author>:<question d-tag>", "<relay hint>"],
    ["e", "<question event id>"],
    ["p", "<expert pubkey>"],
    ["expertise", "lightning-routing"]
  ]
}
```

### Notification Priority

Clients SHOULD prioritize answer requests:
1. **High**: From users the expert follows
2. **Medium**: Matching expert's stated credentials
3. **Low**: General requests

---

## Community Wiki Mode

Community wiki enables collaborative editing without single ownership.

### Tags

```json
["community-wiki", "true"],
["contributors", "<pubkey1>", "<pubkey2>", "<pubkey3>"]
```

### Behavior

- Any registered user can directly edit (not just suggest)
- Show contributors list instead of single author
- All edits tracked via version history
- Contributors list updated with each edit

### When to Use

- Canonical reference answers
- Community-maintained guides
- Evolving documentation
- Collaborative FAQ entries

---

## Voting (NIP-25)

Apollo uses NIP-25 reactions for voting. **Do not create a custom voting system.**

### Upvote

```json
{
  "kind": 7,
  "content": "+",
  "tags": [
    ["e", "<question or answer event id>", "<relay hint>"],
    ["p", "<author pubkey>"],
    ["k", "31993"]
  ]
}
```

### Downvote

```json
{
  "kind": 7,
  "content": "-",
  "tags": [
    ["e", "<question or answer event id>", "<relay hint>"],
    ["p", "<author pubkey>"],
    ["k", "32017"]
  ]
}
```

The `k` tag indicates the kind being reacted to (31993 for questions, 32017 for answers).

---

## Comments (NIP-22)

Apollo uses NIP-22 comments for discussions. **Do not create a custom comment kind.**

### Comment on a Question

```json
{
  "kind": 1111,
  "content": "Could you clarify what you mean by 'channel balance'?",
  "tags": [
    ["K", "31993"],
    ["E", "<question event id>", "<relay hint>", "<question author>"],
    ["A", "31993:<question author>:<question d-tag>", "<relay hint>"],
    ["P", "<question author>"],
    ["k", "31993"],
    ["e", "<question event id>", "<relay hint>", "<question author>"],
    ["a", "31993:<question author>:<question d-tag>", "<relay hint>"],
    ["p", "<question author>"]
  ]
}
```

### Comment on an Answer

```json
{
  "kind": 1111,
  "content": "Great explanation! One minor correction...",
  "tags": [
    ["K", "31993"],
    ["E", "<question event id>", "<relay hint>", "<question author>"],
    ["A", "31993:<question author>:<question d-tag>", "<relay hint>"],
    ["P", "<question author>"],
    ["k", "32017"],
    ["e", "<answer event id>", "<relay hint>", "<answer author>"],
    ["a", "32017:<answer author>:<answer d-tag>", "<relay hint>"],
    ["p", "<answer author>"]
  ]
}
```

Note: NIP-22 comments use plaintext content only (no Markdown).

---

## Deletion (NIP-09)

Authors can delete their content using NIP-09 deletion requests.

### Delete a Question

```json
{
  "kind": 5,
  "content": "Posted by mistake",
  "tags": [
    ["a", "31993:<author>:<question d-tag>"],
    ["k", "31993"]
  ]
}
```

### Delete an Answer

```json
{
  "kind": 5,
  "content": "",
  "tags": [
    ["a", "32017:<author>:<answer d-tag>"],
    ["k", "32017"]
  ]
}
```

**Important**: Deletion is a request, not a guarantee. Content may persist on some relays.

---

## Reporting (NIP-56)

Users can report inappropriate content using NIP-56.

### Report Categories

| Category | Description |
|----------|-------------|
| `spam` | Unsolicited advertising |
| `illegal` | Illegal content |
| `profanity` | Excessive profanity |
| `impersonation` | Impersonating another user |
| `other` | Other violations |

### Report a Question

```json
{
  "kind": 1984,
  "content": "This appears to be spam promoting a scam",
  "tags": [
    ["p", "<question author>", "spam"],
    ["e", "<question event id>"]
  ]
}
```

---

## Bookmarks (NIP-51)

Users can bookmark questions and answers using NIP-51 lists.

### Bookmark Set for Saved Questions

```json
{
  "kind": 30003,
  "content": "",
  "tags": [
    ["d", "saved-questions"],
    ["title", "Saved Questions"],
    ["a", "31993:<author1>:<d-tag1>"],
    ["a", "31993:<author2>:<d-tag2>"],
    ["a", "32017:<author3>:<d-tag3>"]
  ]
}
```

---

## Filtering Patterns

### Fetch Open Questions (exclude closed/archived)

```
Filter: { kinds: [31993], limit: 100 }

For each question:
  status_tag = find tag where tag[0] == "l" AND tag[2] == "status"
  IF status_tag is null OR status_tag[1] == "open":
    include question
```

Note: NIP-01 does not support negative filters, so archived/closed filtering is done client-side.

### Fetch Locked Questions User Can Answer

```
Filter: {
  kinds: [31993],
  #l: ["locked"],
  #p: [<user pubkey>]
}
```

### Fetch Pending Edits for a Question

```
Filter: {
  kinds: [31995],
  #a: ["31993:<question author>:<question d-tag>"],
  #l: ["pending"]
}
```

### Fetch Active Bounties

```
Filter: {
  kinds: [31996],
  #l: ["active"]
}
```

### Fetch Answer Requests for User

```
Filter: {
  kinds: [31997],
  #p: [<user pubkey>]
}
```

### Fetch Votes for a Question/Answer

```
Filter: {
  kinds: [7],
  #e: [<event id>]
}

Aggregate:
  upvotes = count where content == "+"
  downvotes = count where content == "-"
  score = upvotes - downvotes
```

### Fetch Comments for a Question

```
Filter: {
  kinds: [1111],
  #E: [<question event id>]
}
```

### Fetch Questions Marked as Duplicate

```
Filter: {
  kinds: [31993],
  #duplicate-of: ["31993:<original author>:<original d-tag>"]
}
```

---

## Backward Compatibility

- Questions without `status` tags default to `open`
- Questions without `version` tags are treated as version 1
- Existing `p` tags without markers are invited users (not co-authors)
- Clients not supporting new features display questions normally

---

## Implementation Notes

### Content Format

- Questions and answers use **Markdown** content
- Clients SHOULD render Markdown with standard extensions (tables, code blocks, etc.)
- Clients MAY support limited HTML for backward compatibility
- NIP-22 comments use **plaintext only** (per NIP-22 specification)

### Nostr URI References

Use NIP-27 `nostr:` URIs to reference other content:
- `nostr:nevent1...` for specific events
- `nostr:naddr1...` for addressable events
- `nostr:npub1...` for user profiles

### Relay Hints

Always include relay hints in `a` and `e` tags when known to improve discoverability.

---

## Future Considerations

### Spaces (Topic Communities)

- Community-based organization similar to subreddits
- Curator moderation
- Space-specific rules and guidelines

### Credentials System

- Profile-level expertise signals
- Community validation of credentials
- Display with answers in relevant topics

### Gamification

- Badge events tied to achievements
- Leaderboards per topic
- Milestone celebrations
