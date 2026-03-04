"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function AgentSetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    brokerage: "",
    license_number: "",
    license_state: "CA",
    bio: "",
    markets: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: err } = await supabase.from("agents").insert({
      id: user.id,
      brokerage: form.brokerage,
      license_number: form.license_number,
      license_state: form.license_state,
      bio: form.bio || null,
      markets: form.markets.split(",").map((m) => m.trim()).filter(Boolean),
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    router.push("/agent");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <Shield className="mx-auto h-12 w-12 text-brand-600" />
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Complete Your Agent Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Verify your license to start receiving leads</p>
      </div>

      <Card>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="brokerage"
              label="Brokerage Name"
              value={form.brokerage}
              onChange={(e) => setForm((f) => ({ ...f, brokerage: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="license_number"
                label="License Number"
                value={form.license_number}
                onChange={(e) => setForm((f) => ({ ...f, license_number: e.target.value }))}
                required
              />
              <Input
                id="license_state"
                label="License State"
                value={form.license_state}
                onChange={(e) => setForm((f) => ({ ...f, license_state: e.target.value }))}
                maxLength={2}
                required
              />
            </div>
            <Input
              id="markets"
              label="Markets (comma-separated)"
              placeholder="e.g. Monterey County, Santa Cruz County"
              value={form.markets}
              onChange={(e) => setForm((f) => ({ ...f, markets: e.target.value }))}
            />
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                id="bio"
                rows={4}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Tell clients about your experience and specialties..."
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" loading={loading}>
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
