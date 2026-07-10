import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Users, FileText, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <nav className="backdrop-blur-xl bg-white/80 border-b border-white/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Arena KSA</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">{user?.email}</span>
            {isAdmin && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">مسؤول</span>}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">مرحباً {user?.email?.split("@")[0]}</h2>
          <p className="text-gray-600">أهلاً وسهلاً في نظام تقييم الموظفين</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="backdrop-blur-xl bg-white/80 border-white/30 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">الموظفون</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 border-white/30 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">التقييمات</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 border-white/30 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">المستخدمون</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 border-white/30 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">الإحصائيات</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 backdrop-blur-xl bg-white/80 border-white/30 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">الأنشطة الأخيرة</h3>
            <div className="space-y-4">
              <p className="text-gray-600 text-center py-8">لا توجد أنشطة حالياً</p>
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 border-white/30 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">الإجراءات السريعة</h3>
            <div className="space-y-3">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                إضافة تقييم جديد
              </Button>
              {isAdmin && (
                <>
                  <Button variant="outline" className="w-full border-gray-300">
                    إدارة الموظفين
                  </Button>
                  <Button variant="outline" className="w-full border-gray-300">
                    إدارة المستخدمين
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
