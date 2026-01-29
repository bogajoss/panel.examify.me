import { LoginForm } from "@/components/forms";
import { Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | AntiGravity Question Bank",
};

export default function LoginPage() {
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
            The Ultimate <br />
            <span className="text-white/60">Question Bank</span> <br />
            Management.
          </h2>

          <p className="text-xl text-primary-foreground/70 leading-relaxed mb-10">
            Streamline your workflow with our advanced platform for organizing,
            searching, and managing large scale question collections.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full border-2 border-primary bg-primary-foreground/10"
                />
              ))}
            </div>
            <p className="text-sm font-medium text-primary-foreground/80">
              Trusted by 500+ educators worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AntiGravity</span>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
