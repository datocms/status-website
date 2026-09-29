import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import {
  IMPACT_IDS,
  INCIDENT_STATUS_IDS,
  MAINTENANCE_STATUS_IDS,
} from './lib/schema';

// The end-to-end tests build the site from generated fixture files.
const DATA_DIR = process.env.STATUS_DATA_DIR ?? './data';

const incidents = defineCollection({
  loader: glob({ pattern: '**/*.json', base: `${DATA_DIR}/incidents` }),
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
  loader: glob({ pattern: '**/*.json', base: `${DATA_DIR}/maintenances` }),
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
          // 'in_progress' is an alternative spelling this schema has always accepted
          status: z.enum([...MAINTENANCE_STATUS_IDS, 'in_progress']),
          date: z.string(),
        }),
      )
      .optional()
      .default([]),
  }),
});

export const collections = { incidents, maintenances };
