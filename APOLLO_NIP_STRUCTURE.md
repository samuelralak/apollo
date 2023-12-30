NIP-XX
======

Apollo Q&A Platform
---------------

`draft` `optional`

This specification proposes the structure for the Apollo Q&A platform within the NOSTR network, using dedicated custom event kinds for questions and answers. This approach is designed to foster a focused, community-driven knowledge exchange without interfering with existing clients that support standard kinds like kind 1.

## Apollo Q&A Events

Apollo uses distinct custom event kinds to streamline its Q&A functionality, separating it from standard NOSTR content. It introduces two types of events - question and answer.

### Question Event

This type of event is used for posting questions on the Apollo platform. Questions are posted using a specific kind, optimized for effective categorization and discoverability.

#### Format

The format uses a parameterized replaceable event kind `31993`.

The `.content` is the detailed description of the question. It will contain HTML or Markdown strings.

The list of tags are as follows:
* `d` (required) universally unique identifier (UUID) for the question.
* `title` (required) concise title of the question.
* `t` (required, at least one) topic tags for specific categorization.
* `L` (optional) label namespace of `category` per [NIP-32](https://github.com/nostr-protocol/nips/blob/master/32.md)
* `l` (optional) category name e.g `technical` under the label namespace of `category` per [NIP-32](https://github.com/nostr-protocol/nips/blob/master/32.md)
* `e` (optional) reference tag to the accepted answer event id.
* `a` (optional) reference tag to the accepted answer.


```json
{
  "id": "<event id>",
  "pubkey": "<public key of the questioner>",
  "created_at": "<Unix timestamp in seconds>",
  "kind": 31993,
  "content": "<description of question event>",
  "tags": [
    ["d", "<UUID>"],
    ["title", "<title of question event>"],
    ["L", "category"],
    ["l", "<category name e.g technical_and_precise>", "category"],
    ["t", "<topic tag>"],
    ["t", "<topic tag>"],
    ["e", "accepted answer event id"],
    ["a", "32017:<accepted answer author pubkey>:<d-identifier of accepted answer event>", "<optional relay url>", "accepted_answer"]
  ]
}
```

### Answer Event

This event type is for posting answers to the questions. Answers are structured under a different custom kind to directly associate them with their respective questions.

#### Format

The format uses a parameterized replaceable event kind `32017`.

The `.content` is the description of the answer. It will contain HTML or Markdown strings to comprehensively describe the answer.

The list of tags are as follows:
* `d` (required) universally unique identifier (UUID) for the answer.
* `e` (required) reference tag to the question event id.
* `a` (required) reference tag to the corresponding question event.

```json
{
  "id": "<event id>",
  "pubkey": "<public key of the answerer>",
  "created_at": "<Unix timestamp in seconds>",
  "kind": 32017,
  "content": "<HTML or Markdown description of the answer>",
  "tags": [
    ["d", "<UUID>"],
    ["e", "<question event id>"],
    ["a", "31993:<question author pubkey>:<d-identifier of question event>", "<optional relay url>"]
  ]
}
```

## Future Considerations and Potential Unsupported Scenarios

### Gamification with Points and Badges

- [TBD]

### Event Weighting via Upvotes/Downvotes

- [TBD]

### Restricted Answering Based on Points

- [TBD]

