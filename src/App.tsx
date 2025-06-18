import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import PushNotificationPrompt from "@/components/ui/push-notification-prompt";
import { usePWAAutoReload } from "@/hooks/usePWAAutoReload";
import { PWAStatusIndicator } from "@/components/PWAStatusIndicator";
import HomePage from "./pages/HomePage";
import ContentHubPage from "./pages/ContentHubPage";
import ContentDetailPage from "./pages/ContentDetailPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import PodcastDetailPage from "./pages/PodcastDetailPage";
import LivestreamDetailPage from "./pages/LivestreamDetailPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import BookmarksPage from "./pages/BookmarksPage";
import ProfilePage from "./pages/ProfilePage";
import WalletPage from "./pages/WalletPage";
import LoginPage from "./pages/LoginPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CourseListPage from "./pages/CourseListPage";
import ContactUsPage from "./pages/ContactUsPage";
import AboutUsPage from "./pages/AboutUsPage";
import OrdersPage from "./pages/OrdersPage";
import EditProfilePage from "./pages/EditProfilePage";
import LearnPage from "./pages/LearnPage";
import NotFound from "./pages/NotFound";
import PaymentVerifyPage from "./pages/PaymentVerifyPage";
import CommentTestPage from "./pages/CommentTestPage";
import BookmarkTestPage from "./pages/BookmarkTestPage";
import PWATestPage from "./pages/PWATestPage";
import PWADebugPage from "./pages/PWADebugPage";
import NotificationTest from "./pages/NotificationTest";
import AppInstallPage from "./pages/AppInstallPage";
import IdentityVerificationPage from "./pages/IdentityVerificationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: true,
    },
  },
});

// Component for handling video redirect with better error handling
const VideoRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  console.log('VideoRedirect: Redirecting video ID:', id);
  
  if (!id) {
    console.error('VideoRedirect: No ID provided, redirecting to content hub');
    return <Navigate to="/content?type=videos" replace />;
  }
  
  // Validate ID format (basic validation)
  if (!/^\d+$/.test(id)) {
    console.error('VideoRedirect: Invalid ID format:', id);
    return <Navigate to="/content?type=videos" replace />;
  }
  
  return <Navigate to={`/content/video/${id}`} replace />;
};
// PWA Wrapper component to handle auto-reload
const PWAWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { manualReload } = usePWAAutoReload();
  
  // Expose manual reload to global scope for testing
  React.useEffect(() => {
    (window as any).pwaReload = manualReload;
  }, [manualReload]);

  return <>{children}</>;
};
const App: React.FC = () => {
  console.log('App: Initializing application');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DataProvider>
            <PWAWrapper>
              <Toaster />
              <Sonner />
              <PushNotificationPrompt />
              <PWAStatusIndicator />
              <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                </Route>

                {/* Semi-Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/install" element={<AppInstallPage />} />
                <Route path="/about-us" element={<AboutUsPage />} />
                <Route path="/contact-us" element={<ContactUsPage />} />
                <Route path="/content" element={<ContentHubPage />} />
                <Route path="/content/:type/:id" element={<ContentDetailPage />} />
                
                {/* Redirect old video routes to new format */}
                <Route path="/videos/:id" element={<VideoRedirect />} />
                
                {/* Article routes */}
                <Route path="/articles/:id" element={<ArticleDetailPage />} />
                
                {/* Podcast routes */}
                <Route path="/podcasts/:id" element={<PodcastDetailPage />} />
                
                {/* Livestream routes */}
                <Route path="/livestreams/:id" element={<LivestreamDetailPage />} />
                <Route path="/webinars/:id" element={<LivestreamDetailPage />} />
                
                <Route path="/courses" element={<CourseListPage />} />
                <Route path="/courses/:slug" element={<CourseDetailPage />} />
                
                {/* Test Routes */}
                <Route path="/test/comments" element={<CommentTestPage />} />
                <Route path="/test/bookmarks" element={<BookmarkTestPage />} />
                <Route path="/test/pwa" element={<PWATestPage />} />
                <Route path="/test/notifications" element={<NotificationTest />} />
                <Route path="/debug/pwa" element={<PWADebugPage />} />
                
                {/* Payment Verification - Semi-Protected Route */}
                <Route path="/payment-verify" element={<PaymentVerifyPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/complete-profile" element={<CompleteProfilePage />} />
                  <Route path="/my-courses" element={<MyCoursesPage />} />
                  <Route path="/bookmarks" element={<BookmarksPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/identity-verification" element={<IdentityVerificationPage />} />
                  
                  {/* Learn Page - Protected Route */}
                  <Route path="/learn/:courseId" element={<LearnPage />} />
                  
                  {/* Profile Routes */}
                  <Route path="/profile">
                    <Route index element={<ProfilePage />} />
                    <Route path="edit" element={<EditProfilePage />} />
                  </Route>
                  
                  {/* Alternative edit profile route */}
                  <Route path="/edit-profile" element={<EditProfilePage />} />
                </Route>

                {/* Fallback Routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </BrowserRouter>
            </PWAWrapper>
            </DataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
