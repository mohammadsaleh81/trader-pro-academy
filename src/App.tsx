
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import HomePage from "./pages/HomePage";
import ContentHubPage from "./pages/ContentHubPage";
import ContentDetailPage from "./pages/ContentDetailPage";
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
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";

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
              <Route path="/:type/:id" element={<ContentDetailPage />} />
              <Route path="/my-courses" element={<MyCoursesPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/complete-profile" element={<CompleteProfilePage />} />
              <Route path="/courses" element={<CourseListPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/articles/:id" element={<ArticleDetailPage />} />
              <Route path="/contact-us" element={<ContactUsPage />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/edit-profile" element={<EditProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
