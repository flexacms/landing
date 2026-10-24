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
        /** Scenarios use fictional businesses; tutorials are hands-on guides. */
        kind: z.enum(['scenario', 'tutorial']).default('scenario'),
        /** Scenario: who it's about. Tutorial: what you'll build. */
        scenario: z.string(),
        stack: z.string(),
        duration: z.string().optional(),
        /** Snapshot of the content shown in the post's example card. */
        example: z.object({
            heading: z.string(),
            status: z.string(),
            rows: z.array(z.object({ label: z.string(), value: z.string() })),
        }),
    }),
});

export const collections = { blog };
