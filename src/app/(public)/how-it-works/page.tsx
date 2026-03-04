import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home, Search, Calendar, Users, Shield, ArrowRight,
  CheckCircle, Clock, MapPin, Zap,
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          How PreambleHomes Works
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          A smarter way to connect buyers and sellers — before the market
        </p>
      </div>

      {/* For Sellers */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Home className="h-6 w-6 text-brand-600" /> For Sellers
        </h2>
        <div className="mt-6 space-y-4">
          {[
            { step: 1, title: "Create a Pre-Market Intent Profile", desc: "Share that you're considering selling. Set your price range, timeline, and privacy preferences. You control what's visible." },
            { step: 2, title: "Get Matched with Buyers", desc: "Our algorithm matches you with buyers based on price, location, and most importantly — timeline alignment." },
            { step: 3, title: "Connect Through an Agent", desc: "Every connection is facilitated by a licensed real estate agent. Professional, private, and on your terms." },
          ].map((item) => (
            <Card key={item.step}>
              <CardContent className="flex gap-4 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* For Buyers */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Search className="h-6 w-6 text-brand-600" /> For Buyers
        </h2>
        <div className="mt-6 space-y-4">
          {[
            { step: 1, title: "Define What You Want", desc: "Set your criteria: price range, location, size, and type. Nothing unusual here." },
            { step: 2, title: "Set Your Timeline", desc: "This is the key differentiator. Tell us when you want to move — and how flexible you are. We match based on timing, not just specs." },
            { step: 3, title: "Get Notified of Matches", desc: "When a seller's intent profile matches your criteria, you'll be notified. Express interest and an agent will facilitate the introduction." },
          ].map((item) => (
            <Card key={item.step}>
              <CardContent className="flex gap-4 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-50 text-sm font-bold text-accent-700">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Key differentiators */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center">What Makes Us Different</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {[
            { icon: Clock, title: "Timeline Matching", desc: "We prioritize when you want to transact, not just what you want. Overlapping timelines mean smoother, faster deals." },
            { icon: Shield, title: "Privacy First", desc: "Sellers control exactly what's shared. No address required. No photos required. Share as much or as little as you want." },
            { icon: Users, title: "Agent-Mediated", desc: "Every connection goes through a licensed agent. No cold calls. No spam. Professional facilitation from day one." },
            { icon: Zap, title: "Pre-Market Advantage", desc: "Connect months before properties hit the MLS. More time for due diligence, negotiation, and preparation." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6">
              <item.icon className="h-8 w-8 text-brand-600" />
              <h3 className="mt-3 font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Important notice */}
      <section className="mt-16 rounded-xl bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-brand-600" /> Important Information
        </h3>
        <p className="mt-2 text-sm text-gray-600 leading-6">
          PreambleHomes is a pre-market intent platform. Profiles on this site do not constitute
          formal property listings. No listing agreement exists between any parties through this
          platform. Once a formal listing agreement is established between a seller and their agent,
          all applicable MLS rules apply. PreambleHomes is not a brokerage.
        </p>
      </section>

      {/* CTA */}
      <div className="mt-12 text-center">
        <Link href="/signup">
          <Button size="lg">
            Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
