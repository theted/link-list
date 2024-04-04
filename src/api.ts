import { useQuery, useMutation } from "@tanstack/react-query";
import { API_URL } from "./constants";
import { getToken } from "./helpers";

export const getRequest = async (url: string) => {
  return fetch(`${API_URL}/${url}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  })
    .then((res) => res.json())
    .catch((err: Error) => {
      console.log("FETCH ERROR:", err);
    });
};

export const postRequest = async <T>(url: string, data: T) => {
  return fetch(`${API_URL}/${url}`, {
    method: "POST",
    mode: "cors", // needed?
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

// TODO: error handling
export const useGet = <T>(url: string, queryKey: string) => {
  return useQuery<T>({
    queryKey: [queryKey],
    queryFn: () => getRequest(url),
  });
};
