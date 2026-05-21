// Single export surface for Auth.js — used by server actions, middleware,
// route handlers and server components.

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";

export const {
  handlers: { GET: authGET, POST: authPOST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
