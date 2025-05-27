import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If user is authenticated, redirect to the page they came from or homepage
  if (user) {
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
} 