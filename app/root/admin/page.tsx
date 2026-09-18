import LedgerWorkspace from "@/components/LedgerWorkspace";
import { getLoggedInUser, toAppUser } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const loggedIn = await getLoggedInUser();
  if (!loggedIn) redirect("/root/auth/sign-in");
  const user = await toAppUser(loggedIn);
  if (user.mode === "unset") redirect("/root/select-mode");
  return <LedgerWorkspace view="admin" user={user} />;
}
