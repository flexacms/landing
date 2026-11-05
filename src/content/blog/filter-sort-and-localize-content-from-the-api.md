---
title: Filter, sort and localize content from the API
description: Query entries by any field, sort by prices or dates, get a single language back and request only the fields a page needs.
pubDate: 2026-11-04
tag: Product update
kind: update
scenario: Developers building listings, catalogs and multilingual sites
stack: REST API (/api/v1), JavaScript and PHP SDKs, MCP
cover: /images/blog/whats-new/developers.webp
coverAlt: The API & MCP page of a Flexa workspace with the List entries endpoint and a ready-to-run request.
example:
  heading: GET /api/v1/products
  status: 200 OK
  rows:
    - { label: filter, value: 'price ≥ 10, in stock' }
    - { label: sort, value: '-price' }
    - { label: locale, value: es }
    - { label: fields, value: 'price, cover' }
---

The list endpoint used to filter by status, search text and category. That covers a blog index, but a product grid needs "in stock, under $50, cheapest first", and a home page needs "only the featured posts". Before, you fetched everything and filtered in your code. Now the API does it.

## Filter by any field

Add `filter[field]=value` for an exact match, or `filter[field][operator]=value` for anything else:

```bash
GET /api/v1/products?filter[availability]=in_stock&filter[price][lte]=50
GET /api/v1/posts?filter[featured]=true&filter[tags][contains]=design
GET /api/v1/events?filter[starts_on][gte]=2026-11-01
```

| Operator | Meaning |
| --- | --- |
| `eq`, `ne` | Equal, not equal (`filter[kind]=digital` is `eq`) |
| `gt`, `gte`, `lt`, `lte` | Greater or lower than: numbers and dates |
| `in` | One of a comma separated list: `filter[size][in]=s,m,l` |
| `contains` | Text that contains a value, or tags and lists that include it |
| `null` | `true` for entries without a value, `false` for entries with one |

Numbers are compared as numbers (10 is greater than 9) and dates as dates. Booleans without a value count as `false`. Relationship fields match by the ID of the related entry, so `filter[author]=12` lists everything Maya wrote.

## Sort by fields and dates

`sort` takes a comma separated list. A `-` in front sorts in descending order:

```bash
GET /api/v1/products?sort=-price,title
GET /api/v1/posts?sort=-publish_at
```

You can sort by any field of the content model or by `title`, `slug`, `status`, `publish_at`, `created_at` and `updated_at`.

## One language at a time

Translatable fields come back with every language:

```json
"excerpt": { "en": "Model any content", "es": "Modela cualquier contenido" }
```

Add `?locale=es` and each translatable field returns a single value. If an entry has no Spanish text yet, you get the default language instead of an empty field:

```json
"excerpt": "Modela cualquier contenido"
```

## Only the fields you need

Add `fields` to receive only some fields in `values` and `media`. A list of cards doesn't need every entry's rich text body:

```bash
GET /api/v1/posts?fields=excerpt,cover&sort=-created_at&per_page=12
```

## Related entries, in the same request

`include=relations` already expanded relationship fields with each related entry's ID, title and slug. `include=relations.values` adds their field values and media URLs, so a post page can show its author's name, photo and bio without a second request.

## Try it in the API explorer

Every workspace has an interactive explorer under **Developers → API & MCP**. Pick a content model and an endpoint, add your query and send the request with your key. It generates the same call in cURL, JavaScript, PHP and Python.

![The API explorer with the List entries endpoint selected and a sorted request ready to send.](/images/blog/whats-new/developers.webp)

Invalid filters, such as an unknown field or an operator a field type doesn't support, return a `422` response that explains what's wrong. AI clients connected over MCP get the same options: the `list_records` tool accepts `filters` and `sort`.
