'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Settings } from 'lucide-react';

interface UserMenuProps {
  initials: string;
}

export default function UserMenu({ initials }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-9 h-9 bg-[#059669] rounded-full flex items-center justify-center text-white font-medium text-sm hover:ring-2 hover:ring-[#059669]/50 transition-all"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 py-1 bg-white rounded-xl shadow-lg border border-[#E5E7EB] z-50">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-[#1F2937] hover:bg-[#F3F4F6] transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-[#1F2937] hover:bg-[#F3F4F6] transition-colors"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
