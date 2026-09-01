import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  IMPACT_IDS,
  INCIDENT_STATUS_IDS,
  MAINTENANCE_STATUS_IDS,
} from './lib/schema';

const incidents = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './data/incidents' }),
  schema: z.object({
    name: z.string(),
    impact: z.enum(IMPACT_IDS).optional(),
    components: z.array(z.string()).optional().default([]),
    updates: z
      .array(
        z.object({
          content: z.string(),
          status: z.enum(INCIDENT_STATUS_IDS),
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
          // 'in-progress' is a legacy spelling still present in old files
          status: z.enum([...MAINTENANCE_STATUS_IDS, 'in-progress']),
          date: z.string(),
        }),
      )
      .optional()
      .default([]),
  }),
});

export const collections = { incidents, maintenances };
