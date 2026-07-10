/**
 * App.tsx — Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 * Routes, Auth Guard, Providers
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { initializeLanguage } from "./lib/i18n";
import AppLayout from "./components/AppLayout";

// Initialize language on app start
initializeLanguage();

// Pages
import Login from "./pages/Login";
import LoginSupabase from "./pages/LoginSupabase";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Users from "./pages/Users";
import AdminUsers from "./pages/AdminUsers";
import AdminEmployees from "./pages/AdminEmployees";
import Evaluations from "./pages/Evaluations";
import NewEvaluation from "./pages/NewEvaluation";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

function ProtectedRoute({ component: Component, adminOnly = false }: {
  component: React.ComponentType;
  adminOnly?: boolean;
}) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/login-supabase" component={LoginSupabase} />
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/employees">
        <ProtectedRoute component={Employees} />
      </Route>
      <Route path="/departments">
        <ProtectedRoute component={Departments} adminOnly />
      </Route>
      <Route path="/users">
        <ProtectedRoute component={Users} adminOnly />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsers} adminOnly />
      </Route>
      <Route path="/admin/employees">
        <ProtectedRoute component={AdminEmployees} adminOnly />
      </Route>
      <Route path="/evaluations/new">
        <ProtectedRoute component={NewEvaluation} />
      </Route>
      <Route path="/evaluations">
        <ProtectedRoute component={Evaluations} />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={Analytics} adminOnly />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <AuthProvider>
          <TooltipProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "oklch(0.16 0.018 264)",
                  border: "1px solid oklch(1 0 0 / 0.12)",
                  color: "oklch(0.94 0.008 264)",
                },
              }}
            />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
