import React from "react";
import { CourseProvider, useCourse } from "./CourseContext";
import { ContentProvider, useContent } from "./ContentContext";
import { WalletProvider, useWallet } from "./WalletContext";

// Combined Data Provider that wraps all individual providers
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CourseProvider>
      <ContentProvider>
        <WalletProvider>
          {children}
        </WalletProvider>
      </ContentProvider>
    </CourseProvider>
  );
};

// Combined hook that provides access to all contexts
export const useData = () => {
  const courseContext = useCourse();
  const contentContext = useContent();
  const walletContext = useWallet();

  // Calculate loading state more intelligently
  const isAnyLoading = courseContext.isLoading.courses || 
                      contentContext.isLoading.articles || 
                      contentContext.isLoading.videos || 
                      contentContext.isLoading.livestreams ||
                      walletContext.isLoading;

  return {
    // Course data
    courses: courseContext.courses,
    myCourses: courseContext.myCourses,
    enrollCourse: courseContext.enrollCourse,
    fetchCourseDetails: courseContext.fetchCourseDetails,
    
    // Content data
    articles: contentContext.articles,
    podcasts: contentContext.podcasts,
    videos: contentContext.videos,
    webinars: contentContext.webinars,
    livestreams: contentContext.livestreams,
    files: contentContext.files,
    bookmarks: contentContext.bookmarks,
    comments: contentContext.comments,
    addBookmark: contentContext.addBookmark,
    removeBookmark: contentContext.removeBookmark,
    addComment: contentContext.addComment,
    
    // Wallet data
    wallet: walletContext.wallet,
    updateWallet: walletContext.updateWallet,
    refetchWallet: walletContext.refetchWallet,
    
    // Combined loading state (for backwards compatibility)
    isLoading: isAnyLoading,
    
    // Individual loading states and errors
    loadingStates: {
      courses: courseContext.isLoading.courses,
      articles: contentContext.isLoading.articles,
      videos: contentContext.isLoading.videos,
      livestreams: contentContext.isLoading.livestreams,
      wallet: walletContext.isLoading
    },
    
    errors: {
      wallet: walletContext.error
    }
  };
};

// Re-export all types for backward compatibility
export * from "@/types/course";
export * from "@/types/content";
export * from "@/types/wallet";
