import BankCard from '@/components/BankCard'
import HeaderBox from '@/components/HeaderBox'
import { getLoggedInUser, toAppUser } from '@/lib/actions/user.action'
import { getAccounts } from '@/lib/actions/bank.actions'
import React from 'react'

const MyBanks = async () => {
    const loggedIn = await getLoggedInUser()
    if (!loggedIn) return null
    const appUser = await toAppUser(loggedIn)
    if (appUser.mode === 'unset') {
        return null
    }
    const accounts = await getAccounts({ userId: appUser.userId })

    return (
        <section className='flex'>
            <div className='my-bank'>
                <HeaderBox
                    title='My-Bank-Accounts'
                    subtext='Effortlessly manage your banking activities.' />

            <div className='space-y-4'>
                <h2 className='header-2'>
                    Your cards
                </h2>
                <div className='flex flex-wrap gap-6'>
                    {accounts && accounts.data.map((a: Account) => (
                        <BankCard
                            key={a.id}
                            account={a}
                            userName={loggedIn?.firstName}
                            />
                    ))}
                </div>
            </div>
            </div>
        </section>
    )
}

export default MyBanks