import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";
import { Course, CourseDetails } from "@/types/course";

interface CourseContextType {
  courses: Course[];
  myCourses: Course[];
  enrollCourse: (courseId: string) => void;
  fetchCourseDetails: (slug: string) => Promise<CourseDetails | null>;
  navigateToLearn: (courseId: string) => string;
  isLoading: {
    courses: boolean;
  };
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState({
    courses: true
  });

  // Helper function to navigate to learn page
  const navigateToLearn = (courseId: string): string => {
    return `/learn/${courseId}`;
  };

  // Fetch course details
  const fetchCourseDetails = async (slug: string): Promise<CourseDetails | null> => {
    try {
      const response = await api.get(`/crs/courses/${slug}/?include_comments=true&include_chapters=true`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course details:', error);
      return null;
    }
  };

  // Fetch courses from API - works for both logged in and non-logged in users
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(prev => ({ ...prev, courses: true }));
        console.log('Fetching courses...');
        
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
        console.log('Courses API response:', response.data);
        
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

        console.log('Transformed courses:', transformedCourses);
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
          console.log('No auth tokens found, skipping my courses fetch');
          setMyCourses([]);
          return;
        }
        
        const access_token = JSON.parse(auth).access;
        console.log('Fetching my courses with token:', access_token.substring(0, 20) + '...');
        
        const response = await api.get('/crs/my-courses/', {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });
        
        console.log('My courses API response:', response.data);
        
        // Transform API data to match our Course type
        const transformedCourses = response.data.map((course: any) => {
          console.log('Transforming course:', course);
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

        console.log('Transformed my courses:', transformedCourses);
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
      setMyCourses([...myCourses, { ...course, completedLessons: 0 }]);
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        myCourses,
        enrollCourse,
        fetchCourseDetails,
        navigateToLearn,
        isLoading
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
