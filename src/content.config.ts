import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const incidents = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './data/incidents' }),
  schema: z.object({
    name: z.string(),
    impact: z.enum(['none', 'minor', 'major', 'critical']).optional(),
    components: z.array(z.string()).optional().default([]),
    updates: z
      .array(
        z.object({
          content: z.string(),
          status: z.enum([
            'investigating',
            'identified',
            'monitoring',
            'resolved',
          ]),
          date: z.string(),
        }),
      )
      .default([]),
  }),
});

const maintenances = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './data/maintenances' }),
  schema: z.object({
    name: z.string(),
    scheduledTime: z.string(),
    minutes: z.union([z.string(), z.number()]),
    content: z.string().optional(),
    components: z.array(z.string()).optional().default([]),
    updates: z
      .array(
        z.object({
          content: z.string(),
          status: z.enum([
            'scheduled',
            'in_progress',
            'in-progress',
            'verifying',
            'completed',
          ]),
          date: z.string(),
        }),
      )
      .optional()
      .default([]),
  }),
});

export const collections = { incidents, maintenances };
