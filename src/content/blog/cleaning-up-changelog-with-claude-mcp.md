---
title: 'Session log: cleaning up 340 changelog entries with Claude over MCP'
description: The key we created, the rules we gave the assistant, every prompt in order, and the one change we had to undo.
pubDate: 2026-10-20
tag: AI and MCP
scenario: Tally Desk · help desk software · 340 changelog entries since 2022
stack: Next.js docs site reading from Flexa, Claude Code over MCP
example:
  heading: API key · changelog-cleanup-20261020
  status: Revoked
  rows:
    - { label: models, value: Changelog }
    - { label: read · write · mcp, value: Allowed }
    - { label: delete · schema, value: Not allowed }
    - { label: expires, value: 7 days }
---

Tally Desk makes help desk software and has published a changelog entry for every release since 2022. After four years, the changelog had 340 entries, five different spellings of the same tags, and pages describing features that had since been removed.

Nobody had a free week to fix it by hand. This is the log of the afternoon we spent fixing it with Claude, connected to Flexa over MCP.

## The key

We created a key for this job only, and named it after the task and the date:

| Setting | Value |
| --- | --- |
| Name | `changelog-cleanup-20261020` |
| Models | Changelog only |
| Abilities | Read, write, MCP |
| Not allowed | Delete, schema |
| Expires | In 7 days |

Without **delete**, the worst case was a wrong edit, and every edit can be restored from the revision history. Without **schema**, the assistant couldn't change the model itself.

## Connecting

```bash
claude mcp add --transport http flexa \
  https://app.flexacms.com/mcp \
  --header "Authorization: Bearer flx_..."
```

## The rules

Before the first prompt, we gave the assistant these rules:

> You're cleaning up our changelog. Allowed tags are Feature, Fix, Improvement and Security. Never change the body of an entry. Never publish a draft. Work in batches of at most 20 and wait for my OK between batches.

## The session

**1. Audit, read-only.**

> List every entry whose tag isn't one of the allowed tags, and every published entry that mentions "Legacy reports" or "Classic inbox". Don't change anything.

It found **63** entries with nonstandard tags ("bugfix", "Bug Fix", "improvements"…) and **18** published entries about the two removed features. It also mentioned **41** drafts older than a year.

**2. A plan we could check.**

> Show a table with each of the 63 entries, the current tag and the tag you'd use.

We changed four rows. Two were security fixes it had marked as plain fixes.

**3. Small batches.**

> Apply the first 20 rows of the table.

We checked those 20 in the editor, then asked for the next batches. Retagging all 63 took four rounds.

**4. Unpublish, don't delete.**

> Unpublish the 18 entries about Legacy reports and Classic inbox.

They're still in Flexa, and the docs site no longer lists them.

**5. The drafts stayed with people.** The key couldn't delete anything, so the assistant gave us the list of 41 old drafts. A product manager reviewed it the next day and deleted 35 of them in the editor.

## The one change we undid

In the third batch, one entry had moved from Security to Fix, even though our table said Security. We spotted it in the review, opened the entry's revision history and restored the previous version.

## Closing

We revoked the key the same evening, six days before it would have expired. Every change from the session is still in the revision history.

## Results

| | Before | After |
| --- | --- | --- |
| Tag spellings | 9 | 4 |
| Published entries about removed features | 18 | 0 |
| Drafts older than a year | 41 | 6 |

The cleanup took one afternoon for two people, and the assistant never had the power to delete anything.
