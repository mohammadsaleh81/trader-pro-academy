
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute: Current location:', location.pathname);
  console.log('ProtectedRoute: User:', user ? 'authenticated' : 'not authenticated');
  console.log('ProtectedRoute: Loading:', isLoading);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('ProtectedRoute: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trader-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    console.log('ProtectedRoute: Redirecting to login, current path:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If profile is not complete and not already on complete-profile page,
  // redirect to complete profile
  if (!user.isProfileComplete && location.pathname !== "/complete-profile") {
    console.log('ProtectedRoute: Redirecting to complete profile');
    return <Navigate to="/complete-profile" replace />;
  }

  console.log('ProtectedRoute: Allowing access to protected route');
  return <Outlet />;
};

export default ProtectedRoute;
