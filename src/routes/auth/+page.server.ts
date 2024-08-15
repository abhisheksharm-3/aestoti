import { SESSION_COOKIE, createAdminClient, createSessionClient } from "$lib/appwrite.server";
import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { NODE_ENV } from '$env/static/private';
import { ID, OAuthProvider } from "node-appwrite";

export const load: PageServerLoad = async ({ cookies }) => {
    const session = cookies.get(SESSION_COOKIE);
    if (session) {
        try {
            const { account } = createSessionClient(session);
            const user = await account.get();
            return { user };
        } catch {
            cookies.delete(SESSION_COOKIE, { path: '/' });
        }
    }
    return { user: null };
};

export const actions: Actions = {
    login: async ({ request, cookies }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const { account } = createAdminClient();
            const session = await account.createEmailPasswordSession(email, password);
            cookies.set(SESSION_COOKIE, session.providerAccessToken, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });

            return {
                success: true,
                redirect: '/'
            };
        } catch (error) {
            console.error('Login error:', error);
            return fail(400, { success: false, error: 'Invalid credentials' });
        }
    },

    register: async ({ request, cookies }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const name = `${formData.get('firstName')} ${formData.get('lastName')}`;

        try {
            const { account } = createAdminClient();
            await account.create(ID.unique(), email, password, name);
            const session = await account.createEmailPasswordSession(email, password);
            cookies.set(SESSION_COOKIE, session.providerAccessToken, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });

            return {
                success: true,
                redirect: '/'
            };
        } catch (error) {
            console.error('Registration error:', error);
            return fail(400, { success: false, error: 'Registration failed' });
        }
    },

    logout: async ({ cookies }) => {
        cookies.delete(SESSION_COOKIE, { path: '/' });
        return {
            success: true,
            redirect: '/'
        };
    },

    oauth: async ({ url, cookies }) => {
        const { account } = createAdminClient();
    
        try {
          const session = await account.createOAuth2Token(
            OAuthProvider.Google,
            `${url.origin}/oauth`,
            `${url.origin}/signup`
          );


          return {
            success: true,
            redirect: '/'
          };
        } catch (error) {
          console.error('OAuth error:', error);
          return fail(400, { success: false, error: 'OAuth signup failed' });
        }
    },
};
