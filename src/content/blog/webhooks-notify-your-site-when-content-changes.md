---
title: 'Webhooks: tell your site the moment content changes'
description: Register endpoints that receive a signed request when entries are published, updated or deleted. Pick the events and content models, watch every delivery and resend with one click.
pubDate: 2026-11-04
tag: Product update
kind: update
scenario: Teams with static or cached sites, search indexes and automations
stack: Every workspace, under Developers → Webhooks
cover: /images/blog/whats-new/webhooks.webp
coverAlt: The Webhooks page of a Flexa workspace listing three endpoints with their events, scope and last delivery.
example:
  heading: Website revalidation
  status: Active
  rows:
    - { label: event, value: entry.published }
    - { label: entity, value: posts }
    - { label: entry, value: hello-world }
    - { label: response, value: 200 in 241 ms }
---

Until now a website built on Flexa had two ways to stay fresh: rebuild on a timer or cache for a few minutes. Both mean an editor publishes, refreshes the site and waits. Webhooks remove the wait: Flexa calls your endpoint as soon as content changes, and your site revalidates exactly the page that changed.

## Add a webhook

Open **Developers → Webhooks** and click **Add webhook**. Give it a name, the URL to call and the events it should receive. You can also limit it to some content models, for example only `posts` for a Slack notification.

![The Create webhook form with a name, an endpoint URL, the list of events and a content model filter.](/images/blog/whats-new/webhook-create.webp)

After you save, Flexa shows the endpoint's signing secret. You can see it again or rotate it from the webhook's menu at any time.

These are the events you can subscribe to:

| Event | When it's sent |
| --- | --- |
| `entry.created` | An entry was created |
| `entry.updated` | An entry's fields, categories or status were saved |
| `entry.published` | An entry went live, right away or [on its schedule](/blog/schedule-entries-to-publish-themselves) |
| `entry.unpublished` | A published entry moved to draft or archived |
| `entry.deleted` | An entry was moved to the trash or deleted permanently |
| `entry.restored` | An entry came back from the trash |
| `schema.updated` | A content model, its fields or its field groups changed |

Events fire wherever the change comes from: the editor, the REST API, an import or an AI client over MCP. A burst of schema changes, such as importing a template, is grouped into one request per content model.

## What your endpoint receives

Every delivery is a `POST` with a JSON body:

```json
{
  "id": "01a1ad65-1e56-70cd-a91b-426457e77c65",
  "type": "entry.published",
  "created_at": "2026-11-05T20:23:27+00:00",
  "workspace": "lumen-studio",
  "entity": "posts",
  "entry": "how-we-run-design-critiques",
  "data": {
    "id": 11,
    "slug": "how-we-run-design-critiques",
    "title": "How we run design critiques",
    "status": "published",
    "entity": "posts"
  }
}
```

The payload identifies what changed. To get the content itself, fetch the entry from the API as your site already does.

With it come these headers:

- `Flexa-Event`: the event type.
- `Flexa-Delivery`: the delivery ID, the same as `id` in the body. Use it to ignore duplicates.
- `Flexa-Signature`: `t=<timestamp>,v1=<signature>`, an HMAC-SHA256 of `<timestamp>.<body>` with the webhook secret.
- `Authorization: Bearer <secret>`, so the Flexa SDK revalidation handlers work without extra code.

## Next.js: revalidate in one line

If your site uses `@flexacms/next`, the revalidation route you may already have works as a webhook endpoint. It reads `entity` and `entry` from the body and refreshes that entry, or the whole content model for schema changes:

```ts
// app/api/flexa/revalidate/route.ts
import { createRevalidateHandler } from '@flexacms/next';

export const POST = createRevalidateHandler({
    secret: process.env.FLEXA_REVALIDATE_SECRET,
});
```

Set `FLEXA_REVALIDATE_SECRET` to the webhook's signing secret and point the webhook to `https://your-site.com/api/flexa/revalidate`.

## Any other stack: verify the signature

For other frameworks, verify the signature before trusting the request. In Node.js:

```js
import crypto from 'node:crypto';

export function isFromFlexa(rawBody, signatureHeader, secret) {
    const parts = Object.fromEntries(
        signatureHeader.split(',').map((part) => part.split('=')),
    );
    const age = Math.abs(Date.now() / 1000 - Number(parts.t));
    const expected = crypto
        .createHmac('sha256', secret)
        .update(`${parts.t}.${rawBody}`)
        .digest('hex');

    return (
        age < 300 &&
        expected.length === parts.v1?.length &&
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1))
    );
}
```

Sign the raw body exactly as received, before parsing it, and reject old timestamps so a captured request can't be replayed later.

## Every delivery, logged

Each webhook has a delivery log with the event, the status code, the attempts and how long your endpoint took to answer.

![The delivery log of a webhook with delivered and failed requests, response codes and timings.](/images/blog/whats-new/deliveries.webp)

Open **Details** to see the exact payload and your endpoint's response, or **Resend** to send the event again after fixing a problem on your side. **Send test event** from the webhook's menu delivers a `ping` so you can check the endpoint before any content changes.

![The details of a delivery: its ID, the JSON payload and the response body.](/images/blog/whats-new/delivery-details.webp)

## Built to fail safely

- **Retries.** If your endpoint is down or answers with an error, Flexa retries after 10 seconds, 1 minute, 5 minutes, 30 minutes and 2 hours.
- **Never in the way.** Deliveries run in the background. A slow or failing endpoint never slows down or breaks publishing.
- **Public endpoints only.** Flexa doesn't call private or internal network addresses and doesn't follow redirects.
- **Timeouts.** Each request waits up to 10 seconds for an answer.
- **Retention.** Delivery logs are kept for 30 days.

Webhooks are available in every workspace for owners and admins.
