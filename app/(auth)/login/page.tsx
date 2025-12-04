"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Successfully logged in");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen relative bg-[#F0EFEA] overflow-x-hidden flex flex-col justify-start items-center">
      <div className="relative flex flex-col justify-start items-center w-full">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-center min-h-screen">
          <div className="w-px h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>
          <div className="w-px h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          <div className="self-stretch pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-8 sm:pb-12 md:pb-16 flex flex-col justify-center items-center gap-8 sm:gap-10 md:gap-12 relative z-10">
            <div className="flex flex-col items-center gap-4 mb-4">
              <Link href="/" className="flex items-center">
                <img
                  src="/logo.svg"
                  alt="Recoil"
                  className="h-10 w-10 sm:h-12 sm:w-12 object-cover"
                />
              </Link>
            </div>

            <div className="w-full max-w-md bg-white border border-[rgba(55,50,47,0.12)] shadow-sm rounded-2xl overflow-hidden">
              <div className="p-6 sm:p-8 md:p-10 border-b border-[rgba(55,50,47,0.06)]">
                <h1 className="text-2xl sm:text-3xl font-lora font-semibold tracking-tight text-[#37322F] mb-2">
                  Welcome back
                </h1>
                <p className="text-sm sm:text-base text-[rgba(49,45,43,0.80)] font-sans leading-relaxed">
                  Sign in to continue to your knowledge base
                </p>
              </div>

              <form onSubmit={handleLogin} className="p-6 sm:p-8 md:p-10">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-[#37322F] font-sans"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 border-[rgba(55,50,47,0.12)] focus:border-[rgba(55,50,47,0.24)] focus:ring-[rgba(55,50,47,0.08)] bg-white text-[#37322F] font-sans"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-[#37322F] font-sans"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 border-[rgba(55,50,47,0.12)] focus:border-[rgba(55,50,47,0.24)] focus:ring-[rgba(55,50,47,0.08)] bg-white text-[#37322F] font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-8 h-11 sm:h-12 px-6 sm:px-8 relative bg-[#37322F] border border-white/8 shadow-[0_2px_8px_rgba(0,0,0,0.2),0_1px_0_0_rgba(255,255,255,0.06)_inset,0_-1px_0_0_rgba(0,0,0,0.2)_inset] hover:border-white/12 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3),0_1px_0_0_rgba(255,255,255,0.1)_inset,0_-1px_0_0_rgba(0,0,0,0.3)_inset] active:scale-[0.98] overflow-hidden rounded-full flex justify-center items-center transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div
                    className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                      backgroundSize: "150px 150px",
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-white/12 via-transparent to-black/30 rounded-full pointer-events-none" />
                  <div className="flex items-center justify-center gap-2 text-white text-sm sm:text-base font-medium leading-5 font-sans relative z-10">
                    {isLoading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <span>Sign in</span>
                  </div>
                </button>

                <p className="text-sm text-[rgba(49,45,43,0.80)] text-center mt-6 font-sans">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-[#37322F] hover:text-[#37322F]/80 font-medium hover:underline transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
