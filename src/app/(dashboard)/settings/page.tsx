"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Bell } from "lucide-react";
import type { Profile } from "@/types/database";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) {
          const p = data as Profile;
          setProfile(p);
          setForm({
            first_name: p.first_name,
            last_name: p.last_name,
            phone: p.phone || "",
          });
        }
      } catch {
        // Not authenticated
      }
    }
    load();
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || null,
      })
      .eq("id", user.id);

    setSaved(true);
    setLoading(false);
    router.refresh();
  }

  async function handlePasswordChange() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    });
    alert("Password reset email sent. Check your inbox.");
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

      {/* Profile info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Profile Information</h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="first_name"
                label="First Name"
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                required
              />
              <Input
                id="last_name"
                label="Last Name"
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                required
              />
            </div>
            <Input
              id="email"
              label="Email"
              type="email"
              value={profile.email}
              disabled
            />
            <Input
              id="phone"
              label="Phone (optional)"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+1 (555) 000-0000"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Role:</span>
              <Badge variant="info">{profile.role}</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" loading={loading}>Save Changes</Button>
              {saved && <span className="text-sm text-green-600">Saved!</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Security</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            To change your password, we&apos;ll send a reset link to your email.
          </p>
          <Button variant="outline" className="mt-3" onClick={handlePasswordChange}>
            Send Password Reset Email
          </Button>
        </CardContent>
      </Card>

      {/* Notification preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Notifications</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded border-gray-300" />
            <div>
              <p className="text-sm font-medium text-gray-700">New match notifications</p>
              <p className="text-xs text-gray-500">Email me when new matches are found</p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded border-gray-300" />
            <div>
              <p className="text-sm font-medium text-gray-700">Inquiry alerts</p>
              <p className="text-xs text-gray-500">Email me when someone inquires about my listing</p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded border-gray-300" />
            <div>
              <p className="text-sm font-medium text-gray-700">Price change alerts</p>
              <p className="text-xs text-gray-500">Email me when saved listings change price</p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Account info */}
      <Card>
        <CardContent className="py-4">
          <p className="text-xs text-gray-400">
            Account created: {new Date(profile.created_at).toLocaleDateString()} · ID: {profile.id.slice(0, 8)}...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
