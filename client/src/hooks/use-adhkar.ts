import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertDhikr } from "@shared/routes";

function parseWithLogging<T>(schema: any, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useAdhkar() {
  return useQuery({
    queryKey: [api.adhkar.list.path],
    queryFn: async () => {
      const res = await fetch(api.adhkar.list.path, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch adhkar');
      const data = await res.json();
      return parseWithLogging(api.adhkar.list.responses[200], data, "adhkar.list");
    },
  });
}

export function useCreateDhikr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertDhikr) => {
      const validated = api.adhkar.create.input.parse(data);
      const res = await fetch(api.adhkar.create.path, {
        method: api.adhkar.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Validation failed');
        }
        throw new Error('Failed to create dhikr');
      }
      
      return parseWithLogging(api.adhkar.create.responses[201], await res.json(), "adhkar.create");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.adhkar.list.path] }),
  });
}

export function useUpdateDhikr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number, text?: string, historicalCount?: number }) => {
      const validated = api.adhkar.update.input.parse(updates);
      const url = buildUrl(api.adhkar.update.path, { id });
      
      const res = await fetch(url, {
        method: api.adhkar.update.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error('Failed to update dhikr');
      
      return parseWithLogging(api.adhkar.update.responses[200], await res.json(), "adhkar.update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.adhkar.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] });
    },
  });
}

export function useDeleteDhikr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.adhkar.delete.path, { id });
      const res = await fetch(url, { method: api.adhkar.delete.method, credentials: "include" });
      
      if (!res.ok) throw new Error('Failed to delete dhikr');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.adhkar.list.path] }),
  });
}
