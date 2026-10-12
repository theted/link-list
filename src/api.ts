import { useQuery, QueryKey } from "@tanstack/react-query";
import { API_URL } from "./constants";
import { getToken } from "./helpers";

const request = async (url: string, init: RequestInit = {}) => {
  const res = await fetch(`${API_URL}/${url}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) {
    const { message } = await res.json().catch(() => ({}));
    throw new Error(message ?? `Request failed: ${res.status}`);
  }

  return res.json();
};

export const getRequest = async (url: string) => request(url);

export const postRequest = async <T>(url: string, data: T) =>
  request(url, { method: "POST", body: JSON.stringify(data) });

export const deleteRequest = async (url: string) =>
  request(url, { method: "DELETE" });

export const useGet = <T>(url: string, queryKey: QueryKey) => {
  return useQuery<T>({
    queryKey,
    queryFn: () => getRequest(url),
  });
};
