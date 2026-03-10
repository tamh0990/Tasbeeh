import { z } from 'zod';
import { insertAdhkarSchema, insertSessionSchema, adhkar, sessions } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
};

export const api = {
  adhkar: {
    list: {
      method: 'GET' as const,
      path: '/api/adhkar' as const,
      responses: {
        200: z.array(z.custom<typeof adhkar.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/adhkar' as const,
      input: insertAdhkarSchema,
      responses: {
        201: z.custom<typeof adhkar.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/adhkar/:id' as const,
      input: z.object({
        text: z.string().optional(),
        historicalCount: z.number().optional(),
      }),
      responses: {
        200: z.custom<typeof adhkar.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/adhkar/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  sessions: {
    list: {
      method: 'GET' as const,
      path: '/api/sessions' as const,
      responses: {
        200: z.array(z.custom<typeof sessions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sessions' as const,
      input: insertSessionSchema,
      responses: {
        201: z.custom<typeof sessions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}