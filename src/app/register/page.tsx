import { RegisterForm } from "@/components/forms";
import { Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | AntiGravity Question Bank",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side: Content & Branding */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl" />

        <div className="relative z-10 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white p-2 rounded-xl">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tight uppercase">
              AntiGravity
            </h1>
          </div>

          <h2 className="text-5xl font-extrabold leading-tight mb-6">
            Join the <br />
            <span className="text-white/60">Elite Question</span> <br />
            Repository.
          </h2>

          <p className="text-xl text-primary-foreground/70 leading-relaxed mb-10">
            Create an account to start building your own question banks.
            Experience the power of structured data and lightning-fast search.
          </p>

          <div className="space-y-4">
            {[
              "Unlimited question bank storage",
              "Advanced CSV import & validation",
              "Powerful global search across all files",
              "Admin-level controls for large teams",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
                <span className="text-sm font-medium text-primary-foreground/90">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Register Form */}
      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AntiGravity</span>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
