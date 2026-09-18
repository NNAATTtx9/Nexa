"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ModeCard = ({
  title,
  description,
  bullets,
  action,
  mode,
  accent,
  isLoading,
}: {
  title: string;
  description: string;
  bullets: string[];
  action: () => void;
  mode: "demo" | "actual";
  accent: string;
  isLoading: boolean;
}) => (
  <div className={`rounded-2xl border ${accent} bg-white p-6 shadow-sm`}>
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Banking mode</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
    </div>
    <p className="mb-4 text-sm text-slate-600">{description}</p>
    <ul className="mb-6 space-y-2 text-sm text-slate-700">
      {bullets.map((bullet) => (
        <li key={bullet}>• {bullet}</li>
      ))}
    </ul>
    <div className="w-full">
      <input type="hidden" name="mode" value={mode} />
      <Button type="button" onClick={action} className="w-full" disabled={isLoading}>
        {isLoading
          ? title === "Demo Mode"
            ? "Entering Demo Mode..."
            : "Connecting..."
          : title === "Demo Mode"
            ? "Enter Demo Mode"
                : "Choose Actual Mode"}
      </Button>
              </div>
  </div>
);

export default function SelectModePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<"demo" | "actual" | null>(null);

  const chooseMode = async (mode: "demo" | "actual") => {
    setIsSubmitting(mode);
    try {
      const response = await fetch("/api/banking-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Invalid mode selection");
      }

      window.location.assign("/root");
    } catch (error) {
      console.error("Mode selection failed:", error);
      router.replace("/root/auth/sign-in");
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-5xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Welcome</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Choose your banking environment</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Demo Mode and Actual Banking Mode are separate environments. Demo data is simulated and never connects to real financial institutions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ModeCard
            title="Demo Mode"
            description="Explore the banking platform using simulated accounts and transactions."
            bullets={[
              "No bank account connection required",
              "Full access to supported simulated features",
              "Safe testing environment",
              "Resettable mock data",
            ]}
            mode="demo"
            action={() => chooseMode("demo")}
            accent="border-amber-200"
            isLoading={isSubmitting === "demo"}
          />

          <ModeCard
            title="Actual Banking Mode"
            description="Choose Actual Mode, then connect a supported bank account to access real financial data."
            bullets={[
              "Requires authorized bank connection",
              "Subject to provider availability and verification",
              "Uses consent-based access",
              "Real financial data may be displayed",
            ]}
            mode="actual"
            action={() => chooseMode("actual")}
            accent="border-emerald-200"
            isLoading={isSubmitting === "actual"}
          />
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <strong className="font-semibold text-slate-900">Important:</strong> Demo Mode and Actual Banking Mode are intentionally separate. Demo transactions never reach production payment systems.
        </div>
      </div>
    </main>
  );
}
