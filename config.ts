export const port = 8080;

const required = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`The ${name} environment variable must be defined`);
  }
  return value;
};

export const authSecret = required("AUTH_SECRET");
export const googleClientId = required("GOOGLE_CLIENT_ID");
