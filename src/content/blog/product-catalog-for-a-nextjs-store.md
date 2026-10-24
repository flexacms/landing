---
title: Building a product catalog for a Next.js store
description: How to model products with prices, colors, variants and categories in Flexa, and read them from a Next.js storefront with one request.
pubDate: 2026-10-13
tag: Online store
---

A small online store usually starts with products in a spreadsheet and ends with a catalog nobody wants to maintain. The storefront needs structured data, but the people who update prices and stock aren't developers.

Flexa lets you model the catalog once and keep editing it from the editor. The storefront reads the same data through the SDK.

## 1. Model a product

Create a **Product** content type:

- `name` (Text)
- `price` (Number)
- `color` (Color)
- `in_stock` (Toggle)
- `sizes` (Repeater, with a Select field inside)
- `category` (Relationship to a Category model)

Adding a field later, such as `material`, is a change in the builder. There are no database migrations to run.

## 2. Create the storefront key

Create an API key with the **read** ability, limited to the Product and Category models. The storefront only needs to read, so the key can't change prices by accident.

## 3. Read a product in Next.js

With the Next.js SDK, a product page fetches its data in a few lines:

```tsx
import { createFlexaClient } from '@flexacms/next';

const flexa = createFlexaClient({ revalidate: 300 });

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await flexa.entity('products').find(slug);

  return <h1>{product.name}</h1>;
}
```

The `revalidate` option controls how often the page refreshes its data, so a price change appears within a few minutes without a rebuild.

## 4. Change the catalog without a developer

When a price changes or a size sells out, the person who manages the store edits the product and publishes it. If a bulk change goes wrong, the revision history shows what changed and lets you restore each product to its earlier state.
