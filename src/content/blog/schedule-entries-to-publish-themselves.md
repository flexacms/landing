---
title: Schedule entries to publish themselves
description: Write today, go live on Monday at 9:00. Scheduled entries publish on their own, from the editor or the API, and notify your site through webhooks when they do.
pubDate: 2026-11-04
tag: Product update
kind: update
scenario: Editors planning launches, campaigns and weekly posts
stack: Every content model, in the editor and the REST API
cover: /images/blog/whats-new/entries.webp
coverAlt: A list of blog posts in Flexa with published, draft and scheduled entries.
example:
  heading: Case study launch
  status: Scheduled
  rows:
    - { label: status, value: scheduled }
    - { label: publish_at, value: Mon 9:00 AM }
    - { label: then, value: published }
    - { label: webhook, value: entry.published }
---

Launches rarely happen at the moment the content is ready. A case study waits for the client's approval date, a campaign for Monday morning, a weekly post for its usual slot. Until now someone had to remember to come back and press publish. Entries can now do it themselves.

## Schedule from the editor

Open an entry and set its status to **Scheduled**. A **Publish at** field appears: pick the date and time and save.

![An entry in the Flexa editor with the Scheduled status and its publish date and time.](/images/blog/whats-new/scheduled-entry.webp)

Scheduled entries keep their own badge in the list, so it's easy to see what's coming next to what's live and what's still a draft.

![A list of posts with published, draft and scheduled badges.](/images/blog/whats-new/entries.webp)

When the date arrives, Flexa publishes the entry within the minute. The change is recorded in the entry's history like any other edit, so you can always see when it went live.

To change the date, edit **Publish at**. To publish right away, set the status to **Published**. To cancel, set it back to **Draft**.

## Schedule from the API

Send the `scheduled` status with a `publish_at` date when you create or update an entry:

```bash
curl -X POST https://app.flexacms.com/api/v1/posts \
  -H "Authorization: Bearer $FLEXA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Case study: rebuilding the Northwind store",
    "status": "scheduled",
    "publish_at": "2026-11-09T09:00:00-05:00",
    "values": { "excerpt": { "en": "How we rebuilt a store in six weeks." } }
  }'
```

Entries now include `publish_at` in every API response, and you can filter by status (`?status=scheduled`) or sort by date (`?sort=publish_at`) to build an editorial calendar.

A few details:

- `publish_at` is required for scheduled entries. A date in the past publishes the entry right away.
- Scheduling, like publishing, needs a key with the **Write** permission.
- AI clients connected over MCP can schedule entries too: the record tools accept the same `status` and `publish_at`.

## Your site finds out on its own

Publishing on schedule sends the same `entry.published` event as publishing by hand. With a [webhook](/blog/webhooks-notify-your-site-when-content-changes) pointed at your site's revalidation route, the new page appears the moment the entry goes live, with no rebuild and no one watching the clock.
