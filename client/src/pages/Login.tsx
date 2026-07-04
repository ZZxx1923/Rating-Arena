/**
 * Login Page — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 * Dark navy background with centered glass login card
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, User, ShieldCheck, Globe } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { language, toggleLanguage, t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError(t("errorOccurred"));
      return;
    }
    setLoading(true);
    try {
      const success = await login(username.trim(), password);
      if (success) {
        toast.success(t("welcomeBack"));
        setLocation("/dashboard");
      } else {
        setError(t("invalidCredentials"));
      }
    } catch (err: any) {
      setError(err.message || t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, oklch(0.10 0.018 264) 0%, oklch(0.14 0.020 264) 50%, oklch(0.11 0.015 280) 100%)",
      }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663759114716/eRUNRJ3b2Sb7joLBCFhNPQ/login-bg-9eCHih3rx2MrE3D4Jn9ZEZ.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Ambient glow effects */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.60 0.22 264)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.72 0.20 310)" }}
      />

      {/* Login Card */}
      <div
        className="relative z-10 w-full max-w-md mx-4 fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        {/* Glass card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "oklch(1 0 0 / 0.06)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid oklch(1 0 0 / 0.12)",
            boxShadow: "0 32px 64px oklch(0 0 0 / 0.4), 0 0 0 1px oklch(0.60 0.22 264 / 0.1)",
          }}
        >
          {/* Logo & Brand */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 mb-4 rounded-2xl flex items-center justify-center font-bold text-2xl"
              style={{
                background: "linear-gradient(135deg, oklch(0.60 0.22 264 / 0.3), oklch(0.60 0.22 264 / 0.15))",
                border: "1px solid oklch(0.60 0.22 264 / 0.4)",
                color: "white",
                fontFamily: "'Sora', sans-serif",
                boxShadow: "0 0 20px oklch(0.60 0.22 264 / 0.2), inset 0 1px 0 oklch(1 0 0 / 0.1)",
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
            >
              A
            </div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
              Arena
            </h1>
            <p className="text-sm mt-1" style={{ color: "oklch(0.70 0.015 264)" }}>
              Employee Evaluation Platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium" style={{ color: "oklch(0.80 0.01 264)" }}>
                Username
              </Label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "oklch(0.55 0.015 264)" }}
                />
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="pl-10 h-11 text-white placeholder:text-slate-500"
                  style={{
                    background: "oklch(1 0 0 / 0.07)",
                    border: "1px solid oklch(1 0 0 / 0.12)",
                    borderRadius: "0.625rem",
                  }}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium" style={{ color: "oklch(0.80 0.01 264)" }}>
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "oklch(0.55 0.015 264)" }}
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 text-white placeholder:text-slate-500"
                  style={{
                    background: "oklch(1 0 0 / 0.07)",
                    border: "1px solid oklch(1 0 0 / 0.12)",
                    borderRadius: "0.625rem",
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "oklch(0.55 0.015 264)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="text-sm px-3 py-2 rounded-lg fade-in-up"
                style={{
                  background: "oklch(0.65 0.22 15 / 0.15)",
                  border: "1px solid oklch(0.65 0.22 15 / 0.3)",
                  color: "oklch(0.80 0.15 15)",
                }}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold text-white transition-all duration-200"
              style={{
                background: loading
                  ? "oklch(0.50 0.18 264)"
                  : "linear-gradient(135deg, oklch(0.60 0.22 264), oklch(0.55 0.20 280))",
                border: "none",
                borderRadius: "0.625rem",
                boxShadow: loading ? "none" : "0 4px 16px oklch(0.60 0.22 264 / 0.35)",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div
            className="mt-6 p-4 rounded-xl"
            style={{
              background: "oklch(1 0 0 / 0.04)",
              border: "1px solid oklch(1 0 0 / 0.08)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4" style={{ color: "oklch(0.60 0.22 264)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.60 0.22 264)" }}>
                Demo Credentials
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "oklch(0.65 0.015 264)" }}>Admin</p>
                <p className="text-xs font-mono" style={{ color: "oklch(0.85 0.01 264)" }}>admin / admin123</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "oklch(0.65 0.015 264)" }}>Regular User</p>
                <p className="text-xs font-mono" style={{ color: "oklch(0.85 0.01 264)" }}>user / user123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-4" style={{ color: "oklch(0.45 0.01 264)" }}>
          Performance, measured with integrity.
        </p>
      </div>
    </div>
  );
}
