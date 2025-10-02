import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

type Role = "cliente" | "funcionario" | "gerente";

function homeByRole(role?: Role) {
  if (role === "gerente") return "/admin";
  return "/dashboard"; // cliente e funcionario comum
}

/**
 * Protege rotas por autenticação e (opcionalmente) por role.
 * - Se não autenticado: manda para /login e salva "from" para redirect após login.
 * - Se autenticado mas sem role permitida: redireciona para a home pela role do usuário.
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles?: Role[];
}) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  // 1) precisa estar autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2) checa role (se foi especificada)
  if (allowedRoles && allowedRoles.length > 0) {
    const ok = allowedRoles.includes(user?.role as Role);
    if (!ok) {
      return <Navigate to={homeByRole(user?.role as Role)} replace />;
    }
  }

  return children;
}