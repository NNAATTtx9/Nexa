import LedgerWorkspace from '@/components/LedgerWorkspace'
import { getAccounts, getAccount } from '@/lib/actions/bank.actions'
import { getLoggedInUser, toAppUser } from '@/lib/actions/user.action'
import { redirect } from 'next/navigation'
import React from 'react'

export const dynamic = 'force-dynamic';

const Home = async ({ searchParams }: SearchParamProps) => {
    const { id, page } = await searchParams;
    const currentPage = Number(page as string) || 1
    const appwriteUser = await getLoggedInUser();
    if (!appwriteUser) redirect('/root/auth/sign-in');
    const loggedIn = await toAppUser(appwriteUser);
    if (loggedIn.mode === 'unset') redirect('/root/select-mode');
    const accounts = await getAccounts({ userId: loggedIn.userId });
    if (!accounts || accounts.data.length === 0) return <LedgerWorkspace view="dashboard" user={loggedIn} />;

    const appwriteItemId = (id as string) || accounts.data[0].appwriteItemId;
    const account = await getAccount({ appwriteItemId, userId: loggedIn.userId });

    return <LedgerWorkspace view="dashboard" user={loggedIn} accounts={accounts.data} transactions={account?.transactions || []} />;
}

export default Home