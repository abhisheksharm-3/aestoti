// src/routes/account/+page.server.ts

import { SESSION_COOKIE, createSessionClient } from "$lib/appwrite.server";
import { redirect, type Actions, fail } from "@sveltejs/kit";
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
  // Logged out users can't access this page.
  if (!locals.user) {
    throw redirect(303, "/auth");
  }

  // Pass the stored user local to the page.
  return {
    user: locals.user,
  };
};

// Define our log out endpoint/server action.
export const actions: Actions = {
  logout: async ({ cookies }) => {
    try {
      const session = cookies.get(SESSION_COOKIE);
      if (session) {
        const { account } = createSessionClient(session);
        await account.deleteSession("current");
      }
      cookies.delete(SESSION_COOKIE, { path: "/" });
      throw redirect(303, "/auth");
    } catch (error) {
      console.error('Logout error:', error);
      return fail(400, { success: false, error: 'Logout failed' });
    }
  },
};