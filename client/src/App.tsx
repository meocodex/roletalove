import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { StrategyFloatingProvider } from "@/contexts/StrategyFloatingContext";
import AdaptiveStrategyPanel from "@/components/AdaptiveStrategyPanel";
import { Header } from "@/components/layout/Header";
import { PlanSelector } from "@/components/auth/PlanSelector";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import { ForgotPasswordPage } from "@/pages/forgot-password";
import { ResetPasswordPage } from "@/pages/reset-password";
import RouletteDashboard from "@/pages/roulette-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import StrategiesDemoPage from "@/pages/strategies-demo";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <>
          <Header transparent />
          <HomePage />
        </>
      )} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/app" component={() => (
        <>
          <Header />
          <RouletteDashboard />
        </>
      )} />
      <Route path="/plans" component={() => (
        <>
          <Header />
          <PlanSelector />
        </>
      )} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/strategies-demo" component={StrategiesDemoPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StrategyFloatingProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <AdaptiveStrategyPanel />
          </TooltipProvider>
        </StrategyFloatingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
