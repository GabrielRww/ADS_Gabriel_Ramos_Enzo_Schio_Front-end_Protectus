import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";

// Layout components
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ClientDashboard from "@/pages/client/Dashboard";
import Simulacao from "@/pages/client/Simulacao";
import Apolices from "@/pages/client/Apolices";
import Rastreamento from "@/pages/client/Rastreamento";
import { ClientProfile } from "@/pages/client/Profile";

// Admin pages (for funcionario role)
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminClientes from "@/pages/admin/Clientes";
import AdminPropostas from "@/pages/admin/Propostas";
import AdminRastreadores from "@/pages/admin/Rastreadores";
import AdminIncidentes from "@/pages/admin/Incidentes";
import { AdminProfile } from "@/pages/admin/Profile";

import { useAuthStore } from "@/store/authStore";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated, user, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Client Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['cliente']}>
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/simulacao" 
            element={
              <ProtectedRoute allowedRoles={['cliente']}>
                <Simulacao />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/apolices" 
            element={
              <ProtectedRoute allowedRoles={['cliente']}>
                <Apolices />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rastreamento" 
            element={
              <ProtectedRoute allowedRoles={['cliente']}>
                <Rastreamento />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute allowedRoles={['cliente']}>
                <ClientProfile />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['funcionario']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/clientes" 
            element={
              <ProtectedRoute allowedRoles={['funcionario']}>
                <AdminClientes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/propostas" 
            element={
              <ProtectedRoute allowedRoles={['funcionario']}>
                <AdminPropostas />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/rastreadores" 
            element={
              <ProtectedRoute allowedRoles={['funcionario']}>
                <AdminRastreadores />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/incidentes" 
            element={
              <ProtectedRoute allowedRoles={['funcionario']}>
                <AdminIncidentes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/perfil" 
            element={
              <ProtectedRoute allowedRoles={['funcionario']}>
                <AdminProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirects based on role */}
          <Route 
            path="/" 
            element={
              <Navigate to={user?.role === 'funcionario' ? '/admin' : '/dashboard'} replace />
            } 
          />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
