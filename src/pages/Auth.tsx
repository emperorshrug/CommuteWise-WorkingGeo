import React, { useState } from "react"; // Removed useEffect import
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
import { Loader2, Bus } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const { hasAcceptedTerms, setAcceptedTerms, setGuestUser, setUser } =
    useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // FIX: Initialize state directly from store, removed useEffect to avoid loop
  const [termsChecked, setTermsChecked] = useState(hasAcceptedTerms);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsChecked) {
      toast.error("Please accept the terms.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || "",
        display_name: data.user.user_metadata?.display_name || "Commuter",
        role: "user",
      });
      navigate("/");
    }
    setLoading(false);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <Bus className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-slate-900 tracking-tight">
            CommuteWise
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Smart Transport for Quezon City
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* PRIVACY CHECKBOX */}
            <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
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
                and consent to location tracking for routes.
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-sm font-bold shadow-md"
              disabled={loading || !termsChecked}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Log In"}
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

      {/* FOOTER */}
      <div className="absolute bottom-6 text-center w-full">
        <p className="text-[10px] text-slate-400 font-medium">
          © 2025 CommuteWise QC. All rights reserved.
        </p>
      </div>
    </div>
  );
}
