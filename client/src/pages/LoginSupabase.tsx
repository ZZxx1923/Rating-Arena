/**
 * Login Page - Supabase Integration
 * Handles user authentication with Supabase
 */

import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { loginUser } from "@/lib/supabaseAuth";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginSupabase() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await loginUser(email, password);
      if (result.success) {
        // Store user in context
        login(email, password);
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md backdrop-blur-xl bg-white/10 border-white/20">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">نظام التقييم</h1>
          <p className="text-slate-300 text-center mb-8">تسجيل الدخول إلى حسابك</p>

          {error && (
            <Alert className="mb-6 bg-red-500/10 border-red-500/50">
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-slate-300">
              <strong>حسابات تجريبية:</strong>
            </p>
            <p className="text-xs text-slate-400 mt-2">
              البريد: admin@example.com<br />
              كلمة المرور: admin123
            </p>
            <p className="text-xs text-slate-400 mt-2">
              البريد: user@example.com<br />
              كلمة المرور: user123
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
