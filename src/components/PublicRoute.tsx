
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  
  console.log('PublicRoute: Current location:', location.pathname);
  console.log('PublicRoute: User:', user ? 'authenticated' : 'not authenticated');
  console.log('PublicRoute: Loading:', isLoading);

  if (isLoading) {
    console.log('PublicRoute: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trader-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to the page they came from or homepage
  if (user) {
    console.log('PublicRoute: User authenticated, redirecting to:', from);
    return <Navigate to={from} replace />;
  }

  console.log('PublicRoute: Allowing access to public route');
  return <Outlet />;
}
