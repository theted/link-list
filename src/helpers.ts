import { GOOGLE_CLIENT_ID, API_URL } from "@/constants";

// JWT helpers
export const authenticate = async (credential: any) => {
  return fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      credential,
      client_id: GOOGLE_CLIENT_ID,
    }),
  }).then((res) => res.json());
};

export const validateToken = (token: string) => {
  const parsedToken = JSON.parse(atob(token.split(".")[1]));
  const expired = Date.now() >= parsedToken.exp * 1000;
  return { expired, parsedToken };
};
