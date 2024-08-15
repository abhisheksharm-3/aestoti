import { Client, Account } from "node-appwrite";
import { APPWRITE_KEY, APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT } from "$env/static/private";

export const SESSION_COOKIE = "my-custom-session";

export function createAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_KEY);

  return {
    account: new Account(client)
  };
}

export function createSessionClient(session: string) {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

  if (session) {
    client.setSession(session);
  }

  return {
    account: new Account(client)
  };
}