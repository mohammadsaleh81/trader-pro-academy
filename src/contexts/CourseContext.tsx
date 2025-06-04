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

  // Fetch course details using slug or ID
  const fetchCourseDetails = async (slug: string): Promise<CourseDetails | null> => {
    try {
      console.log('Fetching course details for slug:', slug);
      
      // Determine if it's an ID or slug
      const isNumericId = /^\d+$/.test(slug);
      const endpoint = isNumericId ? `/crs/courses/${slug}/` : `/crs/courses/slug/${slug}/`;
      
      console.log('Using endpoint:', endpoint);
      
      const response = await api.get(endpoint);
      console.log('Course details response:', response.data);
      
      // Transform the response to match our CourseDetails interface
      const courseData = response.data;
      
      const transformedData: CourseDetails = {
        info: {
          id: courseData.id?.toString() || '0',
          title: courseData.title || '',
          description: courseData.description || '',
          instructor: courseData.instructor || courseData.instructor_name || 'Unknown Instructor',
          price: parseFloat(courseData.price || '0'),
          created_at: courseData.created || courseData.created_at || new Date().toISOString(),
          updated_at: courseData.updated || courseData.updated_at || new Date().toISOString(),
          status: courseData.status || 'active',
          level: courseData.level || 'beginner',
          language: courseData.language || 'fa',
          tags: courseData.tags || [],
          total_students: courseData.total_students || 0,
          total_duration: courseData.total_duration || 0,
          get_average_rating: courseData.get_average_rating || courseData.rating_avg || 0,
          total_chapters: courseData.total_chapters || courseData.chapters?.length || 0,
          total_lessons: courseData.total_lessons || 0,
          thumbnail: courseData.thumbnail || '',
        },
        chapters: courseData.chapters || [],
        comments: courseData.comments || [],
        user_progress: courseData.user_progress || null
      };
      
      return transformedData;
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
          slug: course.slug,
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
            slug: course.slug,
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
