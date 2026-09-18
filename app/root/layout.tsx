import RootShell from "@/components/RootShell";
import { getLoggedInUser, toAppUser } from "@/lib/actions/user.action";

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children, 
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appwriteUser = await getLoggedInUser();
  const loggedIn = appwriteUser ? await toAppUser(appwriteUser) : null;

  return <RootShell user={loggedIn}>{children}</RootShell>;
}
