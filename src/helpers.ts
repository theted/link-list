import { API_URL } from "@/constants";

// JWT helpers
export const authenticate = async (credential?: string) => {
  return fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential }),
  }).then((res) => res.json());
};

export const getToken = () => localStorage.getItem("token");

export const validateToken = (token: string) => {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const parsedToken = JSON.parse(atob(base64));
  const expired = Date.now() >= parsedToken.exp * 1000;
  return { expired, parsedToken };
};
