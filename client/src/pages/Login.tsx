import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
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
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد.");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تسجيل الدخول.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md backdrop-blur-xl bg-white/80 border-white/30 shadow-2xl relative z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Arena KSA</h1>
            <p className="text-gray-600 mt-2">نظام تقييم الموظفين</p>
          </div>

          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 rounded-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">حسابات تجريبية:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>مسؤول:</strong> admin@example.com / admin123</p>
              <p><strong>مستخدم:</strong> user@example.com / user123</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
