"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Home, Search, Users, Building } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "seller" | "buyer" | "agent" | "admin";

const roles: { value: Role; label: string; desc: string; icon: React.ElementType }[] = [
  { value: "buyer", label: "Buyer", desc: "Browse matches & listings", icon: Search },
  { value: "seller", label: "Seller", desc: "Manage your properties", icon: Home },
  { value: "agent", label: "Agent", desc: "View leads & clients", icon: Users },
  { value: "admin", label: "Admin", desc: "Platform overview", icon: Building },
];

export default function DemoAccessPage() {
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("buyer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/demo-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, role }),
    });

    if (res.ok) {
      const dashboardMap: Record<Role, string> = {
        buyer: "/buyer",
        seller: "/seller",
        agent: "/agent",
        admin: "/admin",
      };
      router.push(dashboardMap[role]);
      router.refresh();
    } else {
      setError("Invalid password");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Home className="mx-auto h-10 w-10 text-brand-600" />
          <h1 className="mt-2 text-xl font-bold text-gray-900">PreambleHomes</h1>
          <p className="text-sm text-gray-500">Enter the demo password to explore</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="password"
              type="password"
              placeholder="Demo password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Role picker */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Explore as...
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-colors",
                      role === r.value
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    <r.icon className="h-5 w-5" />
                    <span className="font-medium">{r.label}</span>
                    <span className="text-[10px] text-gray-400">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" loading={loading}>
              Enter Demo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
