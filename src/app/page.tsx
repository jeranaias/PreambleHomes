import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Users, ArrowRight, Shield, Clock, MapPin } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Every great home sale starts with a{" "}
              <span className="text-brand-600">Preamble</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Connect with buyers and sellers months before a property hits the market.
              Timeline-matched. Agent-mediated. Completely private.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/listings">
                <Button variant="outline" size="lg">
                  Browse Pre-Market
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="mt-4 text-center text-gray-600">
            Three steps to connecting before the market does
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: MapPin,
                title: "Create Your Profile",
                desc: "Sellers share their intent to sell — neighborhood, price range, and timeline. Buyers define what they're looking for and when.",
              },
              {
                icon: Calendar,
                title: "Timeline Matching",
                desc: "Our algorithm matches based on when you want to transact — not just what. Overlapping timelines mean smoother deals.",
              },
              {
                icon: Users,
                title: "Agent-Facilitated Connection",
                desc: "Every connection goes through a licensed agent. Professional, private, and compliant with industry standards.",
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Clock, title: "Pre-Market Advantage", desc: "Find opportunities months before they hit the MLS." },
              { icon: Shield, title: "Privacy First", desc: "Sellers control exactly what information is shared." },
              { icon: Search, title: "Smart Matching", desc: "Scored matches based on price, location, timeline, and specs." },
            ].map((prop, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
                <prop.icon className="h-8 w-8 text-brand-600" />
                <h3 className="mt-3 font-semibold text-gray-900">{prop.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900">Ready to get ahead of the market?</h2>
          <p className="mt-4 text-gray-600">
            Join as a buyer, seller, or agent. Free to start.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg">Create Free Account</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
