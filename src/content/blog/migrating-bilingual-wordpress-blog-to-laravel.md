---
title: Migrating a bilingual WordPress blog to Flexa and Laravel
description: 86 posts in Spanish and English, old URLs that had to keep ranking, and the three things that broke during the import.
pubDate: 2026-10-09
tag: Multilingual blog
scenario: Ruta Viva Tours · walking tours in Barcelona · 86 posts in 2 languages
stack: Laravel site, previously WordPress with a translation plugin
example:
  heading: Post · Best tapas near the Gothic Quarter
  status: ES · EN
  rows:
    - { label: title.es, value: Las mejores tapas cerca del Barrio Gótico }
    - { label: title.en, value: Best tapas near the Gothic Quarter }
    - { label: legacy_url, value: /es/2023/05/tapas-barrio-gotico/ }
    - { label: reading_time, value: 6 min }
---

Ruta Viva runs walking tours in Barcelona, and most of its bookings start on the blog. The blog ran on WordPress with a translation plugin that kept each language as a separate post. The booking site was already Laravel, so the goal was one Laravel app, with the content in Flexa.

This post covers the migration: the model, the import, the redirects and what went wrong.

## The starting point

- 86 posts in Spanish, 79 of them with an English version
- Each language was a separate WordPress post, linked by the translation plugin
- Old URLs like `/es/2023/05/tapas-barrio-gotico/` that still brought in search traffic

## One entry, two languages

In WordPress, a post and its translation were two records that drifted apart. In Flexa they became one **Post** entry with translatable fields:

- translatable: `title`, `slug`, `excerpt`, `body`, `seo_description`
- shared: `cover_image`, `neighborhood`, `reading_time`, `legacy_url`

The `legacy_url` field keeps the old WordPress path, so the redirects can be generated from the content instead of a hand-written list.

## The import

We exported the translation pairs from WordPress to a CSV (`es_id,en_id`), then wrote an Artisan command that read both posts, merged them into one entry, and sent it to the Flexa API with a temporary write key:

```php
Http::withToken(config('services.flexa.import_key'))
    ->post(config('services.flexa.url').'/api/v1/posts', [
        'title' => $es->title,
        'values' => [
            'title' => ['es' => $es->title, 'en' => $en?->title],
            'body' => ['es' => $es->html, 'en' => $en?->html],
            'legacy_url' => $es->path,
        ],
    ])
    ->throw();
```

We checked the exact payload for our model in the workspace's API playground before running it on all 86 posts. Then we revoked the import key.

## Reading posts in Laravel

The site puts the language in the URL (`/es/...`, `/en/...`), and a middleware sets the app locale from it. The Laravel SDK resolves translatable values for the current locale:

```php
use FlexaCms\Laravel\Facades\Flexa;

$posts = Flexa::entity('posts')->published()->paginate(12);

$post = Flexa::entity('posts')->findOrFail($slug);
$post->value('title'); // Spanish on /es, English on /en
```

Each page prints `hreflang` links to its other language, and hides the language switcher when the English version doesn't exist yet.

## Keeping the old URLs

A catch-all route looks up the request path in `legacy_url` and returns a 301 to the new address. No old link returned a 404, and the posts kept their search positions after the switch.

## What broke

**Leftover shortcodes.** Twelve posts still had WordPress shortcodes like `[gallery ids="..."]` in the body. We replaced them with images by hand, because a regex would have hidden the problem instead of fixing it.

**Accents in Catalan names.** A few titles came out as `Barri G&ograve;tic` because of how the export encoded them. We decoded HTML entities in the import command and ran it again.

**Seven posts without English.** We didn't force a translation. Those entries are published in Spanish only, and the English switcher stays hidden until someone writes one.

## How new posts work now

1. A guide writes the post in Spanish.
2. The AI assistant drafts the English values in the same entry.
3. A second person checks place names, prices and opening hours, and rewrites jokes rather than translating them.
4. They publish once, and both languages go live together.

If a reviewer changes a sentence and the team prefers the original, they restore it from the revision history.
