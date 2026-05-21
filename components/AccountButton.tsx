/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Popover, Transition } from "@headlessui/react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";

const AccountButton = () => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return <div className="w-24 h-10" />;
  }

  if (!user) {
    return (
      <Link
        href="/signin"
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-500/50 bg-black/40 text-yellow-300 text-sm font-semibold hover:bg-yellow-500/10 hover:border-yellow-400 transition-all duration-200 shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
        </svg>
        Iniciar sesión
      </Link>
    );
  }

  const displayName = user.user_metadata?.name || user.email?.split("@")[0] || "Cuenta";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-yellow-500/50 bg-black/40 text-yellow-300 text-sm font-semibold hover:bg-yellow-500/10 hover:border-yellow-400 transition-all duration-200 shadow-md focus:outline-none">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-6 h-6 rounded-full shrink-0"
                referrerPolicy="no-referrer"
                width={24}
                height={24}
              />
            ) : (
              <span className="w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-xs font-bold text-yellow-300 uppercase shrink-0">
                {displayName.charAt(0)}
              </span>
            )}
            <span className="max-w-[100px] truncate">{displayName}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-4 h-4 opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </Popover.Button>

          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Popover.Panel className="absolute right-0 z-20 mt-2 w-62">
              <div className="rounded-xl border border-yellow-500/30 bg-gray-900/95 backdrop-blur-sm shadow-xl p-1 space-y-0.5">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-yellow-200 hover:bg-yellow-500/10 transition-colors duration-150 w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
                  </svg>
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-150 w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z" clipRule="evenodd" />
                  </svg>
                  Logout
                </button>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default AccountButton;