import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "../client";

export const TEMPLATES_QUERY_KEY = ["templates"] as const;
export const TEMPLATES_INFINITE_QUERY_KEY = ["templates", "infinite"] as const;

export interface NoteTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateResponse {
  template: NoteTemplate;
}

export function useTemplates() {
  return useQuery({
    queryKey: TEMPLATES_QUERY_KEY,
    queryFn: () => apiGet<{ templates: NoteTemplate[] }>("/api/templates"),
    select: (data) => data.templates,
  });
}

const TEMPLATES_PAGE_SIZE = 6;

export function useTemplatesInfinite() {
  return useInfiniteQuery({
    queryKey: TEMPLATES_INFINITE_QUERY_KEY,
    queryFn: ({ pageParam = 0 }) =>
      apiGet<{ templates: NoteTemplate[]; total: number }>(`/api/templates?limit=${TEMPLATES_PAGE_SIZE}&offset=${pageParam}`),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.templates.length, 0);
      if (loadedCount >= lastPage.total) {
        return undefined;
      }
      return loadedCount;
    },
    initialPageParam: 0,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      templates: data.pages.flatMap((page) => page.templates),
      total: data.pages[0]?.total || 0,
    }),
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      description,
      content,
      category,
      tags,
    }: {
      name: string;
      description?: string;
      content: string;
      category?: string;
      tags?: string[];
    }) =>
      apiPost<CreateTemplateResponse>("/api/templates", {
        name,
        description,
        content,
        category,
        tags,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TEMPLATES_INFINITE_QUERY_KEY });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      name,
      description,
      content,
      category,
      tags,
    }: {
      templateId: string;
      name?: string;
      description?: string;
      content?: string;
      category?: string;
      tags?: string[];
    }) =>
      apiPatch<CreateTemplateResponse>(`/api/templates/${templateId}`, {
        name,
        description,
        content,
        category,
        tags,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TEMPLATES_INFINITE_QUERY_KEY });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) =>
      apiDelete(`/api/templates/${templateId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TEMPLATES_INFINITE_QUERY_KEY });
    },
  });
}

