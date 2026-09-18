import LedgerWorkspace from "@/components/LedgerWorkspace";
import { getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser, toAppUser } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";

export default async function AccountsPage() {
  const loggedIn = await getLoggedInUser();
  if (!loggedIn) redirect("/root/auth/sign-in");
  const user = await toAppUser(loggedIn);
  if (user.mode === "unset") redirect("/root/select-mode");
  const accounts = await getAccounts({ userId: user.userId });
  return <LedgerWorkspace view="accounts" user={user} accounts={accounts?.data} />;
}
