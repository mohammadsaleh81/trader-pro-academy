import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";
import { Course, CourseDetails } from "@/types/course";

interface CourseContextType {
  courses: Course[];
  myCourses: Course[];
  enrollCourse: (courseId: string) => void;
  fetchCourseDetails: (slug: string, forceRefresh?: boolean) => Promise<CourseDetails | null>;
  isLoading: {
    courses: boolean;
  };
  refreshCourseDetails: (slug: string) => Promise<CourseDetails | null>;
  clearCourseCache: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [courseDetailsCache, setCourseDetailsCache] = useState<Record<string, CourseDetails>>({});
  const [isLoading, setIsLoading] = useState({
    courses: true
  });

  // Clear all course cache and reset state
  const clearCourseCache = () => {
    setCourses([]);
    setMyCourses([]);
    setCourseDetailsCache({});
    setIsLoading({ courses: true });
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

  // Fetch courses from API - works for both logged in and non-logged in users
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(prev => ({ ...prev, courses: true }));
        
        // Try to get auth token but don't require it
        const auth = localStorage.getItem('auth_tokens');
        let headers = {};
        
        if (auth) {
          try {
            const tokens = JSON.parse(auth);
            if (tokens.access) {
              headers = {
                'Authorization': `Bearer ${tokens.access}`
              };
            }
          } catch (e) {
            console.log('Invalid auth token, proceeding without authentication');
          }
        }
        
        const response = await api.get('/crs/courses/', { headers });
        
        // Transform API data to match our Course type
        const transformedCourses = response.data.map((course: any) => ({
          id: course.id.toString(),
          title: course.title,
          instructor: course.instructor_name || "Unknown Instructor",
          thumbnail: course.thumbnail,
          description: course.description || "",
          price: parseFloat(course.price || '0'),
          rating: course.rating_avg || 0,
          totalLessons: course.total_lessons || undefined,
          completedLessons: course.completed_lessons || undefined,
          createdAt: course.created,
          updatedAt: course.updated || course.created,
          categories: course.tags || [],
          duration: course.total_duration ? `${course.total_duration} دقیقه` : undefined,
          level: course.level as "beginner" | "intermediate" | "advanced",
          is_enrolled: course.is_enrolled || false,
          progress_percentage: course.progress_percentage || 0
        }));

        setCourses(transformedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setIsLoading(prev => ({ ...prev, courses: false }));
      }
    };

    fetchCourses();
  }, []);

  // Fetch my courses from API
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const auth = localStorage.getItem('auth_tokens');
        if (!auth) {
          setMyCourses([]);
          return;
        }
        
        const access_token = JSON.parse(auth).access;
        
        const response = await api.get('/crs/my-courses/', {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });
        
        // Transform API data to match our Course type
        const transformedCourses = response.data.map((course: any) => {
          return {
            id: course.id.toString(),
            title: course.title,
            instructor: course.instructor_name || "مدرس ناشناس",
            thumbnail: course.thumbnail,
            description: course.description || "",
            price: parseFloat(course.price || '0'),
            rating: course.rating_avg || 0,
            totalLessons: course.total_lessons,
            completedLessons: course.completed_lessons,
            createdAt: course.created,
            updatedAt: course.updated || course.created,
            categories: course.tags || [],
            duration: course.total_duration ? `${course.total_duration} دقیقه` : undefined,
            level: course.level as "beginner" | "intermediate" | "advanced",
            is_enrolled: true,
            progress_percentage: course.progress_percentage || 0
          };
        });

        setMyCourses(transformedCourses);
      } catch (error) {
        console.error('Error fetching my courses:', error);
        setMyCourses([]);
      }
    };

    fetchMyCourses();
  }, []);

  const enrollCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course && !myCourses.find((c) => c.id === courseId)) {
      const enrolledCourse = { ...course, completedLessons: 0, is_enrolled: true };
      setMyCourses([...myCourses, enrolledCourse]);
      
      // Update courses list to reflect enrollment
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
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        myCourses,
        enrollCourse,
        fetchCourseDetails,
        refreshCourseDetails,
        isLoading,
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
