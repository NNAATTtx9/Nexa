'use client';

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";

const UnauthenticatedRedirect = ({ target = "/root/auth/sign-in" }: { target?: string }) => {
  const router = useRouter();

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return null;
};

const RootShell = ({
  children,
  user,
}: Readonly<{
  children: React.ReactNode;
  user: User | null;
}>) => {
  const pathname = usePathname();
  const isLedgerRoute = [
    "/root",
    "/root/accounts",
    "/root/transfers",
    "/root/insights",
    "/root/statements",
    "/root/notifications",
    "/root/settings",
    "/root/operations",
    "/root/admin",
  ].some((route) => pathname === route);

  if (pathname.startsWith("/root/auth") || pathname.startsWith("/root/select-mode")) {
    return <>{children}</>;
  }

  if (!user) {
    return <UnauthenticatedRedirect />;
  }

  if (user.mode === "unset") {
    return <UnauthenticatedRedirect target="/root/select-mode" />;
  }

  if (isLedgerRoute) {
    return <>{children}</>;
  }

  return (
    <main className="flex h-screen w-full font-inter">
      <Sidebar user={user} />

      <div className="flex size-full flex-col">
        <div className="root-layout">
          <Image src="/icons/logo.svg" width={30} height={30} alt="logo" />
          <div>
            <MobileNav user={user} />
          </div>
        </div>
        {children}
      </div>
    </main>
  );
};

export default RootShell;
