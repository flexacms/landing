import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        tag: z.string(),
        author: z.string().default('Flexa team'),
        /**
         * Scenarios use fictional businesses, tutorials are hands-on guides and
         * updates announce product changes.
         */
        kind: z.enum(['scenario', 'tutorial', 'update']).default('scenario'),
        /** Scenario: who it's about. Tutorial: what you'll build. Update: who it's for. */
        scenario: z.string(),
        stack: z.string(),
        duration: z.string().optional(),
        /** Screenshot shown on the post and its card, from /public. */
        cover: z.string().optional(),
        coverAlt: z.string().optional(),
        /** Snapshot of the content shown in the post's example card. */
        example: z.object({
            heading: z.string(),
            status: z.string(),
            rows: z.array(z.object({ label: z.string(), value: z.string() })),
        }),
    }),
});

export const collections = { blog };
