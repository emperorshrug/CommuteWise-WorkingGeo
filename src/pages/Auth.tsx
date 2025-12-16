import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Bus, UserPlus, LogIn } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Auth() {
  const navigate = useNavigate();
  const { hasAcceptedTerms, setAcceptedTerms, setGuestUser, setUser } =
    useAppStore();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); // For registration
  const [loading, setLoading] = useState(false);

  const [termsChecked, setTermsChecked] = useState(hasAcceptedTerms);

  // --- ACTIONS ---

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsChecked) {
      toast.error("Please accept the terms to continue.");
      return;
    }

    setLoading(true);

    try {
      if (activeTab === "login") {
        // LOGIN LOGIC
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || "",
            display_name: data.user.user_metadata?.display_name || "Commuter",
            role: "user",
          });
          toast.success("Welcome back!");
          navigate("/");
        }
      } else {
        // REGISTER LOGIC
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: fullName },
          },
        });
        if (error) throw error;

        if (data.user) {
          toast.success("Account created! You can now log in.");
          setActiveTab("login"); // Switch to login tab
        }
      }
    } catch (error) {
      // FIX: Strict type check instead of 'any'
      const errorMessage =
        error instanceof Error ? error.message : "Authentication failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    if (!termsChecked) {
      toast.error("Please accept the terms.");
      return;
    }
    setAcceptedTerms(true);
    setGuestUser();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Decorative Background Blob */}
      <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-100 rounded-full blur-3xl opacity-50 z-0" />

      <Card className="w-full max-w-md shadow-2xl border-0 z-10 overflow-hidden">
        <CardHeader className="text-center pb-0 bg-white pt-8">
          <div className="mx-auto bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <Bus className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-slate-900 tracking-tight">
            CommuteWise
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium pb-4">
            Smart Transport for Quezon City
          </CardDescription>

          {/* TABS HEADER */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg mt-4 mb-2">
            <button
              onClick={() => setActiveTab("login")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all",
                activeTab === "login"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LogIn size={16} /> Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all",
                activeTab === "register"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <UserPlus size={16} /> Register
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6 bg-white">
          <form onSubmit={handleAuth} className="space-y-4">
            {activeTab === "register" && (
              <div className="space-y-1 animate-in slide-in-from-left-2 fade-in duration-300">
                <Input
                  type="text"
                  placeholder="Full Name"
                  required={activeTab === "register"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-50 border-slate-200 h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11"
              />
              <Input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11"
              />
            </div>

            {/* PRIVACY CHECKBOX */}
            <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="terms"
                checked={termsChecked}
                onChange={(e) => {
                  setTermsChecked(e.target.checked);
                  setAcceptedTerms(e.target.checked);
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none"
              >
                I agree to the{" "}
                <span className="font-bold text-slate-800">
                  Terms of Service
                </span>{" "}
                and consent to location tracking.
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-sm font-bold shadow-lg shadow-blue-200"
              disabled={loading || !termsChecked}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : activeTab === "login" ? (
                "Log In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="bg-white px-2 text-slate-400">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 font-bold text-slate-600 border-slate-200 hover:bg-slate-50"
            onClick={handleGuest}
            disabled={!termsChecked}
          >
            Continue as Guest
          </Button>
        </CardContent>
      </Card>

      {/* WATERMARK NEAR THE CARD */}
      <div className="mt-6 text-center z-10">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          © 2025 CommuteWise
        </p>
        <p className="text-[10px] text-slate-300">Quezon City Pilot Project</p>
      </div>
    </div>
  );
}
