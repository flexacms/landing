---
title: 'Tutorial: build a blog with Next.js and Flexa'
description: From an empty workspace to a deployed blog with a paginated post list, post pages with SEO metadata, generated types and on-demand revalidation.
pubDate: 2026-10-23
tag: Tutorial
kind: tutorial
scenario: A blog with a paginated list, post pages and typed content
stack: Next.js App Router, @flexacms/next
duration: About 30 minutes
example:
  heading: Your blog
  status: Live
  rows:
    - { label: /blog, value: 12 posts per page }
    - { label: '/blog/[slug]', value: Post page + metadata }
    - { label: src/flexa.d.ts, value: Generated types }
    - { label: cache, value: 5 min + on demand }
---

In this tutorial you'll build a blog where writers publish from the Flexa editor and a Next.js site shows the posts. No content lives in the repository, and publishing a post doesn't need a deploy.

You'll need Node 20 or later and a Flexa account.

## 1. Create the workspace

Create a new workspace and pick the **Blog** template. It comes with a **Posts** model and a few sample entries.

Open the Posts model and check that it has these fields. Add any that are missing in the builder:

| Field | Type |
| --- | --- |
| `slug` | Text |
| `excerpt` | Text |
| `body` | Rich text |
| `cover` | Media |

Every entry also has a title. Publish two or three sample posts so the site has something to show.

## 2. Create a read-only API key

Create an API key with the **Read** ability only, limited to the Posts model. The site only reads content, so this key can't change anything even if it leaks.

Check that it works:

```bash
curl "https://app.flexacms.com/api/v1/posts?status=published" \
  -H "Authorization: Bearer flx_..."
```

You should see your published posts in `data` and the total count in `meta`.

## 3. Create the Next.js app

```bash
npx create-next-app@latest my-blog --typescript --app --src-dir
cd my-blog
npm install @flexacms/next
```

Add the API URL and the key to `.env.local`:

```bash
FLEXA_URL=https://app.flexacms.com
FLEXA_API_KEY=flx_...
```

## 4. Generate types

Generate TypeScript types from your content model:

```bash
FLEXA_URL=https://app.flexacms.com FLEXA_API_KEY=flx_... \
  npx @flexacms/cli generate --out src/flexa.d.ts
```

The CLI reads `FLEXA_URL` and `FLEXA_API_KEY` from the environment, not from `.env.local`, so pass them on the command line. Run it again whenever you change the model, and a renamed field becomes a type error instead of a blank page.

Then create the client in `src/lib/flexa.ts`:

```ts
import { createFlexaClient } from '@flexacms/next';
import type { FlexaSchema } from '@/flexa';

export const flexa = createFlexaClient<FlexaSchema>({ revalidate: 300 });
```

`revalidate: 300` keeps each response in Next's data cache for five minutes. Only import this file from server code: the API key must never reach the browser.

## 5. The post list

Create `src/app/blog/page.tsx`:

```tsx
import Link from 'next/link';
import { flexa } from '@/lib/flexa';

const PER_PAGE = 12;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Number((await searchParams).page ?? 1);
  const { data: posts, meta } = await flexa
    .entity('posts')
    .list({ status: 'published', page, perPage: PER_PAGE });
  const lastPage = Math.ceil(meta.total / PER_PAGE);

  return (
    <main>
      <h1>Blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/blog/${post.values.slug ?? post.id}`}>{post.title}</Link>
            <p>{post.values.excerpt}</p>
          </li>
        ))}
      </ul>
      <nav>
        {page > 1 && <Link href={`/blog?page=${page - 1}`}>Newer posts</Link>}
        {page < lastPage && <Link href={`/blog?page=${page + 1}`}>Older posts</Link>}
      </nav>
    </main>
  );
}
```

`status: 'published'` keeps drafts off the public site.

## 6. The post page

Create `src/app/blog/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { flexa } from '@/lib/flexa';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await flexa.entity('posts').find((await params).slug);

  return {
    title: post?.title,
    description: post?.values.excerpt ?? undefined,
  };
}

export default async function PostPage({ params }: Props) {
  const post = await flexa.entity('posts').find((await params).slug);

  if (!post) notFound();

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.values.body ?? '' }} />
    </article>
  );
}
```

`find` accepts a slug or an id and returns `null` when the entry doesn't exist, so a wrong URL shows your 404 page. Both calls hit Next's data cache, so the metadata and the page don't fetch the post twice.

Run `npm run dev` and open `http://localhost:3000/blog`.

## 7. Show new posts right away

With `revalidate: 300`, a new post appears within five minutes. To show it immediately, add a revalidation route at `src/app/api/flexa/revalidate/route.ts`:

```ts
import { createRevalidateHandler } from '@flexacms/next';

export const POST = createRevalidateHandler({
  secret: process.env.FLEXA_REVALIDATE_SECRET,
});
```

Call it after publishing, from a deploy hook, or from any tool that runs when content changes:

```bash
curl -X POST https://your-blog.com/api/flexa/revalidate \
  -H "Authorization: Bearer $FLEXA_REVALIDATE_SECRET" \
  -d '{"entity":"posts"}'
```

Send `"entry": "<slug>"` as well to refresh a single post.

## 8. Deploy

Deploy to any host that runs Next.js, and set `FLEXA_URL`, `FLEXA_API_KEY` (and `FLEXA_REVALIDATE_SECRET` if you added step 7) in its environment variables. Give production its own read-only key rather than reusing the one from your laptop, so you can revoke either one without affecting the other.

## Where to go next

- **Categories and search.** `list` also accepts `category` and `search`, which is enough for a category page and a search box.
- **Two languages.** Mark `title`, `excerpt` and `body` as translatable, then pick the language with `localize` from `@flexacms/client`: `localize(post.values.excerpt, 'es', ['en'])` falls back to English when the Spanish value is missing.
- **Let the AI assistant draft.** Writers can ask the assistant for a first draft or a translation inside the editor, and publish when it reads well.
