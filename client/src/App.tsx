import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Users from "./pages/Users";
import Evaluations from "./pages/Evaluations";
import NotFound from "./pages/NotFound";

function ProtectedRoute({ component: Component, adminOnly = false }: {
  component: React.ComponentType;
  adminOnly?: boolean;
}) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/employees">
        <ProtectedRoute component={Employees} />
      </Route>
      <Route path="/users">
        <ProtectedRoute component={Users} adminOnly />
      </Route>
      <Route path="/evaluations">
        <ProtectedRoute component={Evaluations} />
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
