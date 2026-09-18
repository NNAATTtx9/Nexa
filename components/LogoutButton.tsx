'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const LogoutButton = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/root/auth/sign-in');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      aria-label="Log out"
      title="Log out"
      className="flex size-9 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
    >
      <LogOut size={18} />
    </button>
  );
};

export default LogoutButton;
