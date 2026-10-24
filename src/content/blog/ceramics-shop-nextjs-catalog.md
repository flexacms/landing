---
title: 'Inside a ceramics shop: Next.js, typed content and a five-minute cache'
description: How a small studio's storefront reads 118 products from Flexa, why types are generated in CI, and where the catalog ends and the checkout begins.
pubDate: 2026-10-13
tag: Online store
scenario: Barro Studio · handmade ceramics · 118 products in 6 categories
stack: Next.js App Router, separate checkout provider
example:
  heading: Product · Speckled mug
  status: In stock
  rows:
    - { label: price, value: '28.00' }
    - { label: glaze, value: Oatmeal speckle }
    - { label: sizes, value: 250 ml · 350 ml }
    - { label: category, value: Mugs }
---

Barro Studio sells mugs, bowls and plates made in small batches. Their storefront is a Next.js app built by one of the two founders. Until this project, the catalog was a `products.json` file in the repository, so every restock meant a commit and a deploy, usually from the founder who was also at the kiln.

This is how the catalog works now.

## Architecture

```
Flexa (catalog content) ──read key──▶ Next.js storefront ──▶ checkout provider
```

Flexa holds what the shop shows: names, photos, descriptions, prices and whether a piece is available. The checkout provider holds what the shop sells: stock counts, payments and orders. Keeping that line clear was the most important decision in the project.

## The model

They started from the product catalog template and changed it to fit ceramics:

| Field | Type | Notes |
| --- | --- | --- |
| `name`, `description` | Text, Rich text | |
| `photos` | Media | First photo is the card image |
| `price` | Number | Shown in the shop; the checkout has its own price |
| `glaze` | Select | Six glazes, one new option per season |
| `sizes` | Repeater | Size label plus capacity |
| `in_stock` | Toggle | Controls the badge, not the checkout |
| `category` | Relationship | To the **Category** model |

The 118 products came over from `products.json` with a short import script and a temporary write key, revoked afterwards.

## Types in CI

The storefront's types come from the schema, generated before every build:

```json
{
  "scripts": {
    "prebuild": "npx @flexacms/cli generate",
    "build": "next build"
  }
}
```

When someone renamed `capacity` to `volume` in the editor, the next build failed on a type error instead of rendering empty labels in front of customers.

## Reading products

The product page uses the Next.js SDK:

```tsx
import { createFlexaClient } from '@flexacms/next';

const flexa = createFlexaClient({ revalidate: 300 });

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await flexa.entity('products').find(slug);

  return <ProductView product={product} />;
}
```

`revalidate: 300` caches each page for five minutes. A restock or a price change appears within that window, without a rebuild, and the API isn't called on every visit.

## Sold-out pieces stay online

When `in_stock` is off, the page stays up with a "Sold out" badge and a "Notify me" form instead of returning a 404. Handmade pieces come back in the next firing, and the pages keep their search positions in the meantime.

## Kiln day

Every few weeks a batch comes out of the kiln. The founder who isn't a developer goes through the batch, turns `in_stock` on for each piece and publishes it. New glazes are a new Select option and a few new entries. None of it involves a commit.

## The incident

During a weekend sale, someone lowered the prices of the whole Bowls category by hand and typed two of them wrong. On Monday they opened the history of each affected product, restored the previous versions and made the change again, carefully.

## What they'd do differently

- Generate types from day one. The `capacity` rename would have reached customers without it.
- Write down which system owns which data before modeling. Most of their early questions were about stock counts, which never belonged in the CMS.
