---
title: 'Build log: moving a climbing gym chain''s promos to Flexa'
description: Two weeks of work, a staging and a production key, 14 old promos imported, and what happened in the first month after launch.
pubDate: 2026-10-06
tag: Company website
scenario: Cumbre Climbing · 4 gyms · 2-person marketing team
stack: Astro (server mode) behind a CDN, booking system on its own domain
example:
  heading: Promo · Winter membership
  status: Published
  rows:
    - { label: headline, value: Climb all winter for €49/month }
    - { label: starts_at, value: '2026-12-01' }
    - { label: ends_at, value: '2027-02-28' }
    - { label: priority, value: '10' }
---

Cumbre Climbing runs four bouldering gyms and launches a new promo every six to eight weeks: winter memberships, summer camps for kids, "bring a friend" weeks. The site is built with Astro by a freelance developer, and until this project every promo change was a message to her, a wait and a deploy.

This is the log of how the promos moved to Flexa, from the first model to the first month in production.

## Week 1: modeling the promo

We started by listing every promo from the last two years and writing down what actually changed between them. That list became the **Promo** model:

| Field | Type | Why |
| --- | --- | --- |
| `headline`, `body` | Text, Rich text | The copy marketing rewrites every time |
| `hero_image` | Media | One photo per campaign |
| `cta_label`, `cta_url` | Text | Links to the booking system |
| `starts_at`, `ends_at` | Date | The promo appears and disappears on its own |
| `gyms` | Relationship | Some promos only run at one gym |
| `seo` | Field group | Meta title and description |

Then we imported the 14 promos from the last two years, so marketing had real examples to duplicate. The import used a temporary API key with the **write** ability, which we revoked as soon as the script finished.

## Week 2: wiring up Astro

The site runs Astro in server mode behind a CDN. The homepage reads published promos and picks the one that's active today:

```astro
---
const res = await fetch(
  `${import.meta.env.FLEXA_URL}/api/v1/promos?status=published`,
  { headers: { Authorization: `Bearer ${import.meta.env.FLEXA_KEY}` } },
);
const { data } = await res.json();

const now = new Date();
const promo = data
  .filter((p) => new Date(p.values.starts_at) <= now && now <= new Date(p.values.ends_at))
  .sort((a, b) => (b.values.priority ?? 0) - (a.values.priority ?? 0))[0];

Astro.response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
---
```

The CDN caches the page for a minute, so the API isn't hit on every visit, and a published change is live within about a minute.

## Two keys, two environments

| Key | Used by | Abilities |
| --- | --- | --- |
| `cumbre-web-production` | Production site | Read, Promo and Page models |
| `cumbre-web-staging` | Staging site | Read, Promo and Page models |

Staging also requests drafts, so marketing can check a promo on a real page before publishing it. Production only asks for `status=published`. Neither key can write anything.

## Launch

We switched the homepage on a Tuesday morning, two weeks before the winter campaign. The old hardcoded banner stayed in the code behind a flag for a week, in case we needed to roll back. We didn't, and the flag came out the following Tuesday.

## The first month in production

**The wrong price.** On the first day of the winter campaign, the headline said €39 instead of €49. A member mentioned it at the front desk. The marketing lead opened the entry's revision history, restored the previous version, fixed the number and published again. It took about two minutes.

**Two promos at once.** In January, marketing scheduled a "bring a friend" week while the winter promo was still running, and the homepage showed the wrong one. We added a `priority` field (Number) to the model and one line to the sort. Adding the field didn't need a database migration, and old entries without a priority simply count as zero.

**A 6 MB photo.** Someone uploaded a photo straight from a camera. We now pass `hero_image` through Astro's image optimization, so the size in the editor doesn't matter.

## What we'd do differently

- Add `priority` from the start. Overlapping promos are normal for a business that runs several at once.
- Create the staging key on day one. Marketing used staging far more than we expected.
- Import the old content before training anyone. Duplicating a real promo is easier than starting from an empty form.
