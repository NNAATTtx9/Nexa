'use client'

import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from "./ui/sheet"
import Image from "next/image"
import Link from "next/link"
import { sidebarLinks } from "@/constants"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import LogoutButton from './LogoutButton'

const MobileNav = ({ user }: MobileNavProps) => {
    const pathname = usePathname();

    return (
        <section className="w-full max-w-[264px]">
            <Sheet>
                <SheetTrigger>
                    <Image
                        src="/icons/hamburger.svg"
                        width={30}
                        height={30}
                        alt="Menu"
                        className="cursor-pointer"
                    />
                </SheetTrigger>
                <SheetContent side="left" className="border-none bg-white">
                    <Link href="/root" className="mb-12 cursor-pointer items-center gap-1 px-4">
                        <Image
                            src="/icons/logo.svg"
                            width={34}
                            height={34}
                            alt="Nexa Logo"
                            className="size-[24px] max-xl:size-14"
                        />
                        <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">Nexa</h1>
                    </Link>
                    <div className="mobilenav-sheet">
                        <nav className="flex flex-col gap-6 pt-16 text-white">
                            {sidebarLinks.map((item) => {
                                const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);

                                return (
                                    <SheetClose key={item.label}>
                                        <Link href={item.route} className={cn('mobilenav-sheet_close w-full', {'bg-bank-gradient': isActive })}>
                                            <Image
                                                src={item.imgURL}
                                                alt={item.label}
                                                width={20}
                                                height={20}
                                                className={cn({'brightness-[3] invert-0': isActive})}
                                            />
                                            <p className={cn("text-16 font-semibold text-black-2", {"!text-white": isActive})}>{item.label}</p>
                                        </Link>
                                    </SheetClose>
                                );
                            })}
                        </nav>

                        <div className="mt-6 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-bank-gradient text-sm font-semibold text-white">
                                {user?.firstName?.[0] ?? 'N'}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate text-14 font-semibold text-gray-900">{user?.firstName ?? 'Guest'} {user?.lastName ?? ''}</span>
                                <span className="truncate text-12 text-gray-500">{user?.email ?? ''}</span>
                            </div>
                            <LogoutButton />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </section>
    )
}

export default MobileNav