---
title: Translating a blog into Spanish with the AI assistant
description: A practical workflow for publishing the same blog post in English and Spanish, with a human review step before anything goes live.
pubDate: 2026-10-09
tag: Multilingual blog
author: Flexa team
---

Most teams translate blog posts as an afterthought: the English version goes live, and the Spanish one arrives weeks later or never. The problem is rarely the translation itself. It's the friction of keeping two versions in sync.

In Flexa, a translatable field stores one value per language, and the API returns the value for the locale you ask for. You write once, and every language lives in the same entry.

## 1. Mark the fields that need translating

On the **Post** content type, set `title`, `excerpt` and `body` as translatable. Keep `slug`, `reading_time` and `published_at` shared, since they don't change between languages.

## 2. Write the English version

The author writes the post in English as usual. Nothing about the editing experience changes.

## 3. Ask the assistant for a draft

Ask the AI assistant to translate the entry into Spanish. It fills the Spanish values of the same fields. The English text stays untouched, so you can compare the two side by side.

Treat the draft as a first pass. Check product names, prices and anything legal, and fix the tone where a literal translation reads oddly.

## 4. Publish both languages together

Once both versions are ready, publish the entry. The API returns one value per locale:

```json
{
  "title": { "en": "Our new pricing", "es": "Nuestros nuevos precios" },
  "reading_time": 4
}
```

On the frontend, the SDK's localize helper picks the requested locale and uses its fallback when a translation is missing.

## Review without rushing

Revision history keeps each change to the Spanish values. If a reviewer changes a sentence and you prefer the earlier wording, you can restore it.
