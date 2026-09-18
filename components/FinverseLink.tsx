'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createFinverseLinkToken } from '@/lib/actions/finverse.action';
import { Button } from './ui/button';

type FinverseLinkProps = {
  user: User;
  variant?: 'primary' | 'ghost';
};

const FinverseLink = ({ user, variant = 'primary' }: FinverseLinkProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [institution, setInstitution] = useState('');

  const handleConnect = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { linkUrl, error: linkError } = await createFinverseLinkToken(user.$id, institution || undefined);
      if (!linkUrl) {
        setError(linkError ?? 'Finverse is not configured yet.');
        setIsLoading(false);
        return;
      }
      window.location.assign(linkUrl);
    } catch (linkError) {
      setError(linkError instanceof Error ? linkError.message : 'Unable to prepare the secure bank connection.');
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label className="text-sm">Institution</label>
        <input
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="Leave empty for all / try: OCBC"
          className="input-class h-9 w-64 bg-white px-2"
        />
      </div>
      <Button
        type="button"
        onClick={handleConnect}
        disabled={isLoading}
        className={variant === 'primary' ? 'plaidlink-primary' : 'plaidlink-ghost'}
      >
        {isLoading ? 'Opening secure connection...' : 'Connect a bank'}
      </Button>
      <p className="text-xs leading-5 text-slate-500">
        Finverse supports bank connections across Singapore and other supported markets. Availability depends on the institution.
      </p>
      {error && <p className="max-w-xl text-sm leading-5 text-red-600" role="alert">{error}</p>}
    </div>
  );
};

export default FinverseLink;
