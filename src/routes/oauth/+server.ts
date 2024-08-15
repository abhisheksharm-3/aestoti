// src/routes/oauth/+server.js

import { SESSION_COOKIE, createAdminClient } from "$lib/appwrite.server";

export async function GET(event) {
  // We should have a `userId` and `secret` query parameters in the URL
  const userId = event.url.searchParams.get("userId");
  const secret = event.url.searchParams.get("secret");

  if (!userId || !secret) {
    return new Response("Missing `userId` or `secret` query parameters", {
      status: 400,
    });
  }

  // Exchange the token `userId` and `secret` for a session
  const { account } = createAdminClient();
  const session = await account.createSession(userId, secret);

  // Redirect to the account page, and set the session cookie
  const headers = new Headers({
    location: "/account",
    "set-cookie": event.cookies.serialize(SESSION_COOKIE, session.secret, {
      sameSite: "strict",
      expires: new Date(session.expire),
      secure: true,
      path: "/",
    }),
  });

  return new Response(null, { status: 302, headers });
}
