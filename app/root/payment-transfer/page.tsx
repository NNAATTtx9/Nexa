import HeaderBox from '@/components/HeaderBox'
import PaymentTransferForm from '@/components/PaymentTransferForm'
import { getLoggedInUser, toAppUser } from '@/lib/actions/user.action'
import { getAccounts } from '@/lib/actions/bank.actions'
import React from 'react'

const Transfer = async () => {
        const loggedIn = await getLoggedInUser()
        if (!loggedIn) return null
    const user = await toAppUser(loggedIn)
    if (user.mode === 'unset') return null
    const accounts = await getAccounts({
        userId: user.userId
    })

    if(!accounts) return 

    const accountsData = accounts?.data;

    return (
        <section className='payment-transfer'>
            <HeaderBox
                title='Payment Transfer'
                subtext='Please provide any specific details or notes related to the payment transfer' />

        <section className='size-full pt-5'>
            <PaymentTransferForm accounts={accountsData} />
        </section>
        </section>
    )
}

export default Transfer