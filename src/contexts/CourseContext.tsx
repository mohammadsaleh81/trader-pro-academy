import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";
import { Course, CourseDetails } from "@/types/course";
import { coursesApi } from "@/lib/api";
import { PaginationState } from "@/types/pagination";
import { useAuth } from "./AuthContext";

interface CourseContextType {
  courses: Course[];
  myCourses: Course[];
  enrollCourse: (courseId: string) => void;
  fetchCourseDetails: (slug: string, forceRefresh?: boolean) => Promise<CourseDetails | null>;
  loadMoreCourses: () => Promise<void>;
  loadMoreMyCourses: () => Promise<void>;
  refreshMyCourses: () => Promise<void>;
  isLoading: {
    courses: boolean;
    myCourses: boolean;
  };
  pagination: {
    courses: PaginationState;
    myCourses: PaginationState;
  };
  refreshCourseDetails: (slug: string) => Promise<CourseDetails | null>;
  clearCourseCache: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [courseDetailsCache, setCourseDetailsCache] = useState<Record<string, CourseDetails>>({});
  const [isLoading, setIsLoading] = useState({
    courses: true,
    myCourses: false
  });
  const [pagination, setPagination] = useState({
    courses: { currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrevious: false },
    myCourses: { currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrevious: false }
  });

  // Utility function to sync enrollment status between courses and myCourses
  const updateCoursesEnrollmentStatus = (myCoursesData: Course[]) => {
    const myCoursesIds = new Set(myCoursesData.map(course => course.id));
    setCourses(prevCourses => 
      prevCourses.map(course => ({
        ...course,
        is_enrolled: myCoursesIds.has(course.id)
      }))
    );
  };

  // Clear all course cache and reset state
  const clearCourseCache = () => {
    setCourses([]);
    setMyCourses([]);
    setCourseDetailsCache({});
    setIsLoading({ courses: true, myCourses: false });
    setPagination({
      courses: { currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrevious: false },
      myCourses: { currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrevious: false }
    });
  };

  // Listen for logout event to clear cache
  useEffect(() => {
    const handleLogout = () => {
      clearCourseCache();
    };

    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  // Fetch course details with caching and force refresh option
  const fetchCourseDetails = async (slug: string, forceRefresh: boolean = false): Promise<CourseDetails | null> => {
    // Return cached version if available and not forcing refresh
    if (!forceRefresh && courseDetailsCache[slug]) {
      return courseDetailsCache[slug];
    }

    try {
      const response = await api.get(`/crs/courses/${slug}/?include_comments=true&include_chapters=true`);
      const courseDetails = response.data;
      
      // Update cache
      setCourseDetailsCache(prev => ({
        ...prev,
        [slug]: courseDetails
      }));
      
      return courseDetails;
    } catch (error) {
      console.error('Error fetching course details:', error);
      return null;
    }
  };

  // Force refresh course details
  const refreshCourseDetails = async (slug: string): Promise<CourseDetails | null> => {
    return fetchCourseDetails(slug, true);
  };

  // Fetch courses from API - use new paginated API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(prev => ({ ...prev, courses: true }));
        const response = await coursesApi.getAll(1, 10);
        
        setCourses(response.results);
        setPagination(prev => ({
          ...prev,
          courses: {
            currentPage: response.current_page,
            totalPages: response.total_pages,
            totalCount: response.count,
            hasNext: !!response.next,
            hasPrevious: !!response.previous
          }
        }));
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setIsLoading(prev => ({ ...prev, courses: false }));
      }
    };

    fetchCourses();
  }, []);

  // Effect to sync enrollment status when both courses and myCourses are loaded
  useEffect(() => {
    if (courses.length > 0 && !isLoading.myCourses) {
      updateCoursesEnrollmentStatus(myCourses);
    }
  }, [courses.length, myCourses.length, isLoading.myCourses]);

  // Fetch my courses from API - use new paginated API
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        // Wait until auth is loaded
        if (authLoading) {
          return;
        }

        // Check if user is authenticated
        if (!user) {
          console.log('CourseContext: User not authenticated, clearing myCourses');
          setMyCourses([]);
          setIsLoading(prev => ({ ...prev, myCourses: false }));
          return;
        }
        
        console.log('CourseContext: User authenticated, fetching myCourses');
        setIsLoading(prev => ({ ...prev, myCourses: true }));
        const response = await coursesApi.getMyCourses(1, 10);
        
        console.log('CourseContext: myCourses fetched:', response.results);
        setMyCourses(response.results);
        setPagination(prev => ({
          ...prev,
          myCourses: {
            currentPage: response.current_page,
            totalPages: response.total_pages,
            totalCount: response.count,
            hasNext: !!response.next,
            hasPrevious: !!response.previous
          }
        }));

        // Update courses with enrollment status based on myCourses
        updateCoursesEnrollmentStatus(response.results);
      } catch (error) {
        console.error('Error fetching my courses:', error);
        setMyCourses([]);
      } finally {
        setIsLoading(prev => ({ ...prev, myCourses: false }));
      }
    };

    fetchMyCourses();
  }, [user, authLoading]);

  const enrollCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course && !myCourses.find((c) => c.id === courseId)) {
      const enrolledCourse = { ...course, completedLessons: 0, is_enrolled: true, progress_percentage: 0 };
      
      // Update myCourses first
      setMyCourses(prev => [enrolledCourse, ...prev]);
      
      // Update courses list to reflect enrollment immediately
      setCourses(prevCourses => prevCourses.map(c => 
        c.id === courseId ? { ...c, is_enrolled: true } : c
      ));
      
      // Clear course details cache to force refresh
      setCourseDetailsCache(prev => {
        const newCache = { ...prev };
        // Find course slug by ID and remove from cache
        Object.keys(newCache).forEach(slug => {
          if (newCache[slug].info.id === courseId) {
            delete newCache[slug];
          }
        });
        return newCache;
      });
      
      // Force refresh my courses list from server (this will also sync the enrollment status)
      refreshMyCourses();
    }
  };

  const refreshMyCourses = async () => {
    try {
      // Check if user is authenticated
      if (!user) {
        console.log('CourseContext: User not authenticated, clearing myCourses');
        setMyCourses([]);
        return;
      }
      
      console.log('CourseContext: Refreshing myCourses for user:', user.id);
      const response = await coursesApi.getMyCourses(1, 10);
      console.log('CourseContext: myCourses refreshed:', response.results);
      
      setMyCourses(response.results);
      setPagination(prev => ({
        ...prev,
        myCourses: {
          currentPage: response.current_page,
          totalPages: response.total_pages,
          totalCount: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }
      }));

      // Update courses with enrollment status based on refreshed myCourses
      updateCoursesEnrollmentStatus(response.results);
    } catch (error) {
      console.error('Error refreshing my courses:', error);
    }
  };

  const loadMoreCourses = async () => {
    if (!pagination.courses.hasNext || isLoading.courses) return;
    
    try {
      setIsLoading(prev => ({ ...prev, courses: true }));
      const response = await coursesApi.getAll(pagination.courses.currentPage + 1, 10);
      setCourses(prev => [...prev, ...response.results]);
      setPagination(prev => ({
        ...prev,
        courses: {
          currentPage: response.current_page,
          totalPages: response.total_pages,
          totalCount: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }
      }));
    } catch (error) {
      console.error('Error loading more courses:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, courses: false }));
    }
  };

  const loadMoreMyCourses = async () => {
    if (!pagination.myCourses.hasNext || isLoading.myCourses) return;
    
    try {
      setIsLoading(prev => ({ ...prev, myCourses: true }));
      const response = await coursesApi.getMyCourses(pagination.myCourses.currentPage + 1, 10);
      setMyCourses(prev => [...prev, ...response.results]);
      setPagination(prev => ({
        ...prev,
        myCourses: {
          currentPage: response.current_page,
          totalPages: response.total_pages,
          totalCount: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }
      }));
    } catch (error) {
      console.error('Error loading more my courses:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, myCourses: false }));
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        myCourses,
        enrollCourse,
        fetchCourseDetails,
        loadMoreCourses,
        loadMoreMyCourses,
        refreshMyCourses,
        refreshCourseDetails,
        isLoading,
        pagination,
        clearCourseCache
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return context;
};
