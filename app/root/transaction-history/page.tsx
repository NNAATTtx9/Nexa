import HeaderBox from '@/components/HeaderBox'
import { getAccount, getAccounts } from '@/lib/actions/bank.actions'
import { getLoggedInUser, toAppUser } from '@/lib/actions/user.action'
import { formatAmount } from '@/lib/utils'
import TransactionsTable from '@/components/TransactionTable'
import { Pagination } from '@/components/Pagination'
import React from 'react'

const TransactionHistory = async ({ searchParams }: SearchParamProps) => {
    const { id, page } = await searchParams;

    const currentPage = Number(page as string) || 1;
    const loggedIn = await getLoggedInUser();
    if (!loggedIn) return null;
    const user = await toAppUser(loggedIn);
    if (user.mode === 'unset') return null;
    const accounts = await getAccounts({ userId: user.userId });
    if (!accounts || accounts.data.length === 0) return null;
    const appwriteItemId = (id as string) || accounts.data[0].appwriteItemId;
    const account = await getAccount({ appwriteItemId, userId: user.userId });
    if (!account) return null;

const rowsPerPage = 10;
const totalPages = Math.ceil(account.transactions.length / rowsPerPage);

    const indexOfLastTransaction = currentPage * rowsPerPage; 
  const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage

    const currentTransactions = account.transactions.slice(
    indexOfFirstTransaction, indexOfLastTransaction
  )

    return (
        <div className='transactions'>
            <div className='transactions-header'>
                <HeaderBox
                    title='Transaction History'
                    subtext='See your bank details and transactions' />
            </div>

            <div className='space-y-6'>
                <div className='transactions-account'>
                 <div className='flex flex-col gap-2'>
                    <h2 className='text-18 font-bold text-white'>{account?.data.name}</h2>
                        <p className='text-14 text-blue-25'>
                            {account?.data.officialName}
                        </p>
                        <p className='text-14 font-semibold tracking-[1.1px] text-white'>
                            **** **** **** {account?.data.mask}
                        </p>
                 </div>

                 <div className='transactions-account-balance'>
                    <p className='text-14'>Current balance</p>
                    <p className='text-24 text-center font-bold'>
                        {formatAmount(account.data.currentBalance)}
                    </p>
                 </div>
                </div>

                <section className='flex w-full flex-col gap-6'>
                    <TransactionsTable transactions={currentTransactions} />
                </section>
                    {totalPages > 1 && (
                        <div className="my-4 w-full">
                        <Pagination totalPages={totalPages} page={currentPage} />
                        </div>
                     )}
            </div>
        </div>
    )
}

export default TransactionHistory;