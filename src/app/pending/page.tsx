import { redirect } from "next/navigation";

// Signup is now open (no manual approval). This route is retained only to
// gracefully bounce any old links straight into the app.
export const dynamic = "force-dynamic";

export default function PendingPage() {
  redirect("/dashboard");
}
