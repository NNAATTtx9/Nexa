'use client'

import Image from 'next/image'
import Link from 'next/link'
import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'
import FinverseLink from './FinverseLink'

type SidebarProps = {
        user: User
}

const Sidebar = ({ user }: SidebarProps) => {
    const pathname = usePathname();
    return (
        <section className="sidebar">
            <nav className="flex flex-col gap-4">
                <Link href="/root" className="mb-12 cursor-pointer items-center gap-2">
                    <Image
                        src="/icons/logo.svg"
                        width={34}
                        height={34}
                        alt="Nexa Logo"
                        className="size-[24px] max-xl:size-14"
                    />
                    <h1 className="sidebar-logo">Nexa</h1>
                </Link>

                {sidebarLinks.map((item) => {
                    const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);

                    return (
                        <Link href={item.route} key={item.label} className={cn('sidebar-link', {'bg-bank-gradient': isActive })}>
                            <div className="relative size-6">
                                <Image
                                    src={item.imgURL}
                                    alt={item.label}
                                    fill
                                    className={cn({'brightness-[3] invert-0': isActive})}
                                />
                            </div>
                            <p className={cn("sidebar-label", {"!text-white": isActive})}>{item.label}</p>
                        </Link>
                    )
                })}

                <FinverseLink user={user} />

                <div className="mt-auto flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-bank-gradient text-sm font-semibold text-white">
                        {user?.firstName?.[0] ?? 'N'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-14 font-semibold text-gray-900">
                            {user?.firstName ?? 'Guest'} {user?.lastName ?? ''}
                        </span>
                        <span className="text-12 text-gray-500">{user?.email ?? ''}</span>
                    </div>
                    <LogoutButton />
                </div>
            </nav>
        </section>
    )
}

export default Sidebar