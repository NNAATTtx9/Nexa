'use client';

import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod" 
import { useForm } from "react-hook-form" 
import { Button } from "@/components/ui/button"
import {
    Form,
} from "@/components/ui/form" 
import { authFormSchema } from '@/lib/utils';
import CustomInput from './CustomInput'
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/actions/user.action';
import FinverseLink from './FinverseLink';

const countries = [
    ['SG', 'Singapore'], ['US', 'United States'], ['GB', 'United Kingdom'],
    ['AU', 'Australia'], ['CA', 'Canada'], ['HK', 'Hong Kong'],
    ['JP', 'Japan'], ['DE', 'Germany'], ['FR', 'France'], ['NL', 'Netherlands'],
    ['IE', 'Ireland'], ['IT', 'Italy'], ['ES', 'Spain'], ['NZ', 'New Zealand'],
    ['MY', 'Malaysia'], ['AE', 'United Arab Emirates'], ['IN', 'India'],
] as const;

const AuthForm = ({ type }: { type: string }) => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const formSchema = authFormSchema(type);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            address1: '',
            city: '',
            country: 'SG',
            regionCode: '',
            postalCode: '',
            dateOfBirth: '',
            ssn: '',
            email: "",
            password: '',
        },
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        setErrorMessage('');

        try {

            if (type === 'sign-up') {
                const result = await signUp(data as SignUpParams);
                if (!result.user) {
                    setErrorMessage(result.error ?? 'Unable to create your account. Please try again.');
                    return;
                }
                setUser(result.user as unknown as User);
                return;
            }

            if (type === 'sign-in') {
                const result = await fetch('/api/auth/sign-in', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        email: data.email,
                        password: data.password,
                    }),
                });
                const response = await result.json();

                if (result.ok && response.success) {
                    router.replace('/root');
                    router.refresh();
                } else {
                    setErrorMessage(response.error ?? 'Invalid email or password.');
                }
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className="auth-form">
            <header className="flex flex-col gap-5 md:gap-8">
                <Link href="/root" prefetch={false} className="mb-12 flex cursor-pointer items-center gap-2">
                    <Image
                        src="/icons/logo.svg"
                        width={34}
                        height={34}
                        alt="Nexa Logo"
                        className="size-[24px] max-xl:size-14"
                    />
                    <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">Nexa</h1>
                </Link>

                <div className="flex flex-col gap-1 md:gap-3">
                    <h1 className='text-24 lg:text-36 font-semibold text-gray-900'>
                        {user
                        ? 'Link Account'
                        : type === 'sign-in'
                            ? 'Log in'
                            : 'Sign up'
                        }
                    </h1>
                    <p className="text-16 font-normal text-gray-600">
                        {user
                            ? 'Link your account to get started'
                            : type === 'sign-in'
                                ? 'Welcome back! Please enter your details.'
                                : 'Create your account and get started.'
                        }
                    </p>
                </div>
            </header>
            {errorMessage && (
                <p className="mt-4 text-sm text-red-600" role="alert">{errorMessage}</p>
            )}
            {user ? (
                <div className="mt-8 flex flex-col gap-4" role="status" aria-live="polite">
                    <div className="flex items-start gap-3 rounded-lg border border-green-100 bg-green-50 p-4">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={20} />
                        <p className="text-sm text-green-800">Your global profile is ready. Connect a supported bank or continue with a manual account.</p>
                    </div>
                    <FinverseLink user={user} variant='primary' />
                </div>
            ) : (
                <>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {type === 'sign-up' && (
                                <>
                                <div className="flex gap-4">
                                    <CustomInput control={form.control} name='firstName' label="First Name" placeholder='Enter your first name' />
                                    <CustomInput control={form.control} name='lastName' label="Last Name" placeholder='Enter your last name' />
                                </div>
                                <div className="flex gap-4">
                                    <CustomInput control={form.control} name='address1' label="Address" placeholder='Enter your specific address' />
                                    <CustomInput control={form.control} name='city' label="City" placeholder='Enter your city' />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="form-item">
                                        <label className="form-label" htmlFor="country">Country</label>
                                        <select id="country" className="input-class h-12 w-full bg-white" {...form.register('country')}>
                                            {countries.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                                        </select>
                                    </div>
                                    <CustomInput control={form.control} name='regionCode' label="State / Region" placeholder='Example: SG or CA' />
                                </div>
                                <div className="flex gap-4">
                                    <CustomInput control={form.control} name='postalCode' label="Postal Code" placeholder='Example: 11101' />
                                </div>
                                <div className="flex gap-4">
                                    <CustomInput control={form.control} name='dateOfBirth' label="Date of Birth" placeholder='Example: YYYY-MM-DD' />
                                    <CustomInput control={form.control} name='ssn' label="Identity number" placeholder='Last 4 digits or local ID' />
                                </div>
                                </>
                            )}

                            <CustomInput control={form.control} name='email' label='Email' placeholder='Enter your email' />
                            <CustomInput control={form.control} name='password' label='Password' placeholder='Enter your password' />

                            <div className='flex flex-col gap-4'>
                            <Button type="submit" disabled={isLoading} className='form-btn'>
                                {isLoading ?(
                                    <>
                                        <Loader2 size={20} className="animated-spin" /> &nbsp; {type === 'sign-up' ? 'Signing up...' : 'Logging in...'}
                                    </>
                                ) : type === 'sign-in'
                                  ? 'Login' : 'Sign Up'}
                            </Button>
                            </div>
                        </form>
                    </Form>

                    <footer className='flex justify-center gap-1'>
                        <p className='text-14 font-normal text-gray-600'>
                            {type === 'sign-in'
                            ? "Don't have an account?"
                            : "Already have an account?"}
                        </p>
                        <Link href={type === 'sign-in' ? '/root/auth/sign-up' : '/root/auth/sign-in'} className="form-link">
                                {type === 'sign-in' ? 'Sign up' : 'Sign in'}
                        </Link>
                    </footer>
                </>
            )}
        </section>
    )
}

export default AuthForm 
