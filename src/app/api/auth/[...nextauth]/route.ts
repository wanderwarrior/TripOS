// Auth.js v5 catch-all route handler. Auth.js owns /signin, /signout, the
// callback URL, CSRF and the session endpoint. Our custom /login and
// /signup pages POST into these handlers via `signIn()` from
// `@/lib/auth`.

export { authGET as GET, authPOST as POST } from "@/lib/auth";
