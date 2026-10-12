import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "./constants";
import { getToken } from "./helpers";
import { UNAUTHORIZED_EVENT } from "./AuthProvider";

export type Link = {
  id: number;
  url: string;
  title: string | null;
  createdAt: string;
  categoryId: number | null;
  // Stable React key across the optimistic row and the saved one
  clientKey?: number;
  pending?: boolean;
};

export type Category = { id: number; name: string; pending?: boolean };

const request = async <T>(url: string, init: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${API_URL}/${url}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (res.status === 401) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  if (!res.ok) {
    const { message } = await res.json().catch(() => ({}));
    throw new Error(message ?? `Request failed: ${res.status}`);
  }

  return res.json();
};

const send = <T>(method: string, url: string, data?: unknown) =>
  request<T>(url, {
    method,
    body: data === undefined ? undefined : JSON.stringify(data),
  });

const LINKS = ["links"];
const CATEGORIES = ["categories"];

export const useLinks = () =>
  useQuery({ queryKey: LINKS, queryFn: () => request<Link[]>("links") });

export const useCategories = () =>
  useQuery({
    queryKey: CATEGORIES,
    queryFn: () => request<Category[]>("categories"),
  });

const tempId = () => -Date.now() - Math.random();

type NewLink = { url: string; category: number | null; title?: string | null };

// Shows the link straight away, then swaps in the saved one with its title
export const useAddLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, category, title }: NewLink & { key: number }) =>
      send<Link>("POST", "links", { url, category, title }),
    onMutate: async ({ url, category, title, key }) => {
      await queryClient.cancelQueries({ queryKey: LINKS });
      queryClient.setQueryData<Link[]>(LINKS, (old = []) => [
        {
          id: key,
          clientKey: key,
          url,
          title: title ?? null,
          categoryId: category,
          createdAt: new Date().toISOString(),
          pending: true,
        },
        ...old,
      ]);
    },
    onSuccess: (link, { key }) => {
      queryClient.setQueryData<Link[]>(LINKS, (old = []) =>
        old.map((l) => (l.clientKey === key ? { ...link, clientKey: key } : l))
      );
    },
    onError: (_err, { key }) => {
      queryClient.setQueryData<Link[]>(LINKS, (old = []) =>
        old.filter((l) => l.clientKey !== key)
      );
    },
  });
};

export const addLinkVariables = (link: NewLink) => ({ ...link, key: tempId() });

type LinkChanges = { title?: string | null; category?: number | null };

export const useUpdateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...changes }: LinkChanges & { id: number }) =>
      send<Link>("PATCH", `links/${id}`, changes),
    onMutate: async ({ id, title, category }) => {
      await queryClient.cancelQueries({ queryKey: LINKS });
      const previous = queryClient.getQueryData<Link[]>(LINKS);
      queryClient.setQueryData<Link[]>(LINKS, (old = []) =>
        old.map((l) =>
          l.id === id
            ? {
                ...l,
                ...(title !== undefined && { title: title?.trim() || null }),
                ...(category !== undefined && { categoryId: category }),
              }
            : l
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(LINKS, context?.previous);
    },
  });
};

export const useDeleteLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (link: Link) => send<Link>("DELETE", `links/${link.id}`),
    onMutate: async (link) => {
      await queryClient.cancelQueries({ queryKey: LINKS });
      const previous = queryClient.getQueryData<Link[]>(LINKS);
      queryClient.setQueryData<Link[]>(LINKS, (old = []) =>
        old.filter((l) => l.id !== link.id)
      );
      return { previous };
    },
    onError: (_err, _link, context) => {
      queryClient.setQueryData(LINKS, context?.previous);
    },
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => send<Category>("POST", "categories", { name }),
    onSuccess: (category) => {
      queryClient.setQueryData<Category[]>(CATEGORIES, (old = []) => [
        ...old,
        category,
      ]);
    },
  });
};

export const useRenameCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      send<Category>("PATCH", `categories/${id}`, { name }),
    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES });
      const previous = queryClient.getQueryData<Category[]>(CATEGORIES);
      queryClient.setQueryData<Category[]>(CATEGORIES, (old = []) =>
        old.map((c) => (c.id === id ? { ...c, name: name.trim() } : c))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(CATEGORIES, context?.previous);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => send<Category>("DELETE", `categories/${id}`),
    onSuccess: (_category, id) => {
      queryClient.setQueryData<Category[]>(CATEGORIES, (old = []) =>
        old.filter((c) => c.id !== id)
      );
      queryClient.setQueryData<Link[]>(LINKS, (old = []) =>
        old.filter((l) => l.categoryId !== id)
      );
    },
  });
};
