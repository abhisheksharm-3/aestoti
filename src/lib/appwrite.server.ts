import { Client, Account } from 'node-appwrite';
import { APPWRITE_KEY } from '$env/static/private';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from '$env/static/private';

export const SESSION_COOKIE = 'my-custom-session';

export function createAdminClient() {
    const client = new Client()
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID)
        .setKey(APPWRITE_KEY); // Set the Appwrite API key!

    // Return the services we want to use.
    return {
        get account() {
            return new Account(client);
        }
    };
}

export function createSessionClient(event: any) {
    const client = new Client()
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID);

    // Extract our custom domain's session cookie from the request
    const session = event.cookies.get(SESSION_COOKIE);
    if (!session) {
        throw new Error("No user session");
    }

    client.setSession(session);

    // Return the services we want to use.
    return {
        get account() {
            return new Account(client);
        }
    };
}
