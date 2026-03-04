"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Search, User, LogOut } from "lucide-react";
import type { Profile } from "@/types/database";

export function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          if (data) setProfile(data as Profile);
        }
      } catch {
        // Supabase not configured yet — skip auth
      }
    }
    loadProfile();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/");
    router.refresh();
  }

  const dashboardPath = profile ? `/${profile.role}` : "/login";

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-brand-600" />
          <span className="text-lg font-bold text-gray-900">
            Preamble<span className="text-brand-600">Homes</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/listings" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <Search className="h-4 w-4" />
            Browse
          </Link>
          <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
            How It Works
          </Link>
          {profile ? (
            <div className="flex items-center gap-3">
              <Link href={dashboardPath}>
                <Button variant="outline" size="sm">
                  <User className="mr-1 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-gray-700">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/listings" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>
              Browse Listings
            </Link>
            <Link href="/how-it-works" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>
              How It Works
            </Link>
            {profile ? (
              <>
                <Link href={dashboardPath} className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="text-left text-sm text-gray-600">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>Log in</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
