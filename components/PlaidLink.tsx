'use client';

import { Button } from './ui/button'
import { PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { createLinkToken, exchangePublicToken } from '@/lib/actions/user.action';

const PlaidLink = ({ user, variant }: PlaidLinkProps) => {
    const router = useRouter();

    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [isLinking, setIsLinking] = useState(false);

    useEffect(() => {
        let active = true;
        const getLinkToken = async () => {
            try {
                const data = await createLinkToken(user);
                if (active) setToken(data.linkToken);
            } catch (error) {
                console.error(error);
                if (active) setError('Unable to prepare bank connection.');
            }
        }

        getLinkToken();
        return () => { active = false; };
    }, [user]);

    const onSuccess = useCallback(async (public_token: string | null) => {
        if (!public_token) {
            setError('Plaid did not return a public token.');
            return;
        }

        setIsLinking(true);
        setError('');
        try {
            await exchangePublicToken({ publicToken: public_token, user });
            router.push('/root');
        } catch (error) {
            console.error(error);
            setError('Unable to link this bank account.');
        } finally {
            setIsLinking(false);
        }
    }, [router, user])

    const config: PlaidLinkOptions ={
        token, 
        onSuccess
    }

    const { open, ready } = usePlaidLink(config);

    const className = variant === 'primary' ? 'plaidlink-primary' : 'plaidlink-ghost';

    return (
        <div className="flex flex-col gap-2">
            <Button onClick={() => open()} disabled={!ready || isLinking} className={className}>
                {isLinking ? 'Connecting...' : 'Connect bank'}
            </Button>
            <p className="text-xs leading-5 text-slate-500">
                Bank availability depends on your country and provider. Some institutions, including YouTrip, may require a supported regional connector or manual import.
            </p>
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        </div>
    )
}

export default PlaidLink