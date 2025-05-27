
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import HomePage from "./pages/HomePage";
import ContentHubPage from "./pages/ContentHubPage";
import ContentDetailPage from "./pages/ContentDetailPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
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
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DataProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                </Route>

                {/* Semi-Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about-us" element={<AboutUsPage />} />
                <Route path="/contact-us" element={<ContactUsPage />} />
                <Route path="/content" element={<ContentHubPage />} />
                <Route path="/content/:type/:id" element={<ContentDetailPage />} />
                
                {/* Article routes */}
                <Route path="/articles/:id" element={<ArticleDetailPage />} />
                
                <Route path="/courses" element={<CourseListPage />} />
                <Route path="/courses/:slug" element={<CourseDetailPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/complete-profile" element={<CompleteProfilePage />} />
                  <Route path="/my-courses" element={<MyCoursesPage />} />
                  <Route path="/bookmarks" element={<BookmarksPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  
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
          </DataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
