---
title: "What's new in Flexa: November 2026"
description: Webhooks, scheduled publishing, a more capable content API and a roomier editor. Here's everything that shipped this month.
pubDate: 2026-11-05
tag: Product update
kind: update
scenario: Everyone using Flexa
stack: Available now in every workspace
cover: /images/blog/whats-new/dashboard.webp
coverAlt: The dashboard of a Flexa workspace with content stats and two weeks of API traffic.
example:
  heading: November 2026
  status: Shipped
  rows:
    - { label: webhooks, value: 7 events }
    - { label: scheduling, value: publish_at }
    - { label: api, value: filter · sort · locale }
    - { label: editor, value: Full width }
---

This month was about what happens after you press publish: telling your site, publishing at the right time and getting exactly the content each page needs. Everything below is available today in every workspace.

## Webhooks

Flexa can now call your endpoints when content changes: when entries are created, updated, published, unpublished, deleted or restored, and when a content model changes. Each webhook picks its events and, optionally, its content models. Requests are signed, retried when your endpoint fails and logged so you can see every delivery and resend it.

The most common use is instant revalidation: point a webhook at your Next.js revalidation route and a published post appears on your site within seconds, without rebuilding.

![The Webhooks page with three endpoints, their events and their last delivery.](/images/blog/whats-new/webhooks.webp)

[Read the full webhooks guide →](/blog/webhooks-notify-your-site-when-content-changes)

## Scheduled publishing

Set an entry's status to **Scheduled**, pick a date and time, and Flexa publishes it for you. It works from the editor, the REST API and AI clients over MCP, and it sends the same `entry.published` webhook as publishing by hand.

![An entry scheduled to publish on Saturday at 9:00 AM.](/images/blog/whats-new/scheduled-entry.webp)

[How scheduling works →](/blog/schedule-entries-to-publish-themselves)

## A more capable content API

The list endpoint can now filter and sort by any field, so a product grid or a "featured posts" section is one request:

```bash
GET /api/v1/products?filter[price][lte]=50&filter[availability]=in_stock&sort=-price
```

Also new:

- `?locale=es` returns translatable fields in one language, with a fallback to the default language.
- `?fields=excerpt,cover` returns only the fields a page needs.
- `include=relations.values` expands related entries with their field values and media URLs.
- Entries include `publish_at`, and you can sort by it.

The API explorer in **Developers → API & MCP** documents all of it and builds the request for you.

[Filtering, sorting and locales in detail →](/blog/filter-sort-and-localize-content-from-the-api)

## Smaller improvements

- **Room to work.** The panel now uses the full width of your screen, so wide tables like entries, deliveries and API keys get more room for their columns.
- **Clearer AI tools.** AI clients connected over MCP now see which tools only read content and which ones delete it, so they can ask for confirmation before destructive actions.

If something you need is missing, tell us.
