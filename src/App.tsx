
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import HomePage from "./pages/HomePage";
import ContentHubPage from "./pages/ContentHubPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import BookmarksPage from "./pages/BookmarksPage";
import ProfilePage from "./pages/ProfilePage";
import WalletPage from "./pages/WalletPage";
import LoginPage from "./pages/LoginPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import CourseDetailPage from "./pages/CourseDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/content" element={<ContentHubPage />} />
              <Route path="/my-courses" element={<MyCoursesPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/complete-profile" element={<CompleteProfilePage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
