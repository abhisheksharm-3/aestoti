import { createSessionClient } from '$lib/appwrite.server';
import { SESSION_COOKIE } from '$lib/appwrite.server';

export async function handle({ event, resolve }) {
  const session = event.cookies.get(SESSION_COOKIE);
  
  if (session) {
    try {
      const { account } = createSessionClient(session);
      event.locals.user = await account.get();
    } catch {
      event.cookies.delete(SESSION_COOKIE, { path: '/' });
    }
  }
  
  return resolve(event);
}