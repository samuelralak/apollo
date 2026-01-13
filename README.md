# Apollo

A Q&A platform built on Nostr. Named after the Greek deity of knowledge and enlightenment.

## About

Apollo provides a structured space for asking and answering questions on the Nostr network. It uses custom event kinds for questions, answers, suggested edits, bounties, and answer requests.

See [APOLLO_NIP_STRUCTURE.md](./APOLLO_NIP_STRUCTURE.md) for the full protocol specification.

## Features

- **Questions & Answers** - Parameterized replaceable events (kinds 31993, 32017)
- **Question Status** - Open, locked, closed, archived states
- **Suggested Edits** - Community editing with author approval
- **Bounties** - Incentivize answers with sats
- **Voting & Comments** - Via NIP-25 reactions and NIP-22 comments
