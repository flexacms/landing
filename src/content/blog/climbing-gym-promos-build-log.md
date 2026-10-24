---
title: Launching a campaign page without waiting for a deploy
description: How a marketing team can update a landing page, swap the hero image and roll back a bad change, without asking a developer to redeploy the site.
pubDate: 2026-10-06
tag: Company website
---

Campaign pages change often: a new headline for the sale, a different hero image, a button that should point to the offer that's live this week. If every change goes through a developer and a deploy, the campaign starts late and ends before the copy is right.

With Flexa, the page's content lives in a content model that marketing can edit, and the site reads it through the API.

## 1. Model the page once

Create a content type called **Landing page** with a few fields:

- `headline` (Text)
- `body` (Rich text)
- `hero_image` (Media)
- `cta_url` (Text)
- `starts_at` (Date)

The developer builds the template once, reading these fields from the API. After that, the page is just content.

## 2. Give the site a read-only key

Create an API key with the **read** ability, limited to the Landing page model. The site only needs to read pages, so it can't delete or overwrite anything even if the key leaks.

## 3. Publish the campaign

Marketing duplicates the previous campaign entry, edits the headline and the image, and publishes it. The site shows the new content on its next request, with no code change and no redeploy.

## 4. Roll back if something is wrong

Every edit is saved in the revision history. If the new headline has a typo or the wrong price, open the previous version and restore it. You don't need a developer to undo a content change.

## What the developer owns

The layout, the components and the caching. Content, copy and images are owned by the people who know what the campaign says.
