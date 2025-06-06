
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { CourseChapter } from "@/types/course";
import { useIsMobile } from "@/hooks/use-mobile";

interface CourseChaptersListProps {
  chapters: CourseChapter[];
}

const CourseChaptersList: React.FC<CourseChaptersListProps> = ({ chapters }) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      {chapters.map((chapter, index) => (
        <Card key={chapter.id} className="border border-gray-200">
          <CardContent className={`${isMobile ? 'p-3 sm:p-4' : 'p-6'}`}>
            <div className={`${isMobile ? 'mb-3' : 'flex justify-between items-start mb-4'}`}>
              <div className="text-right">
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-2`}>
                  فصل {index + 1}: {chapter.title}
                </h3>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>{chapter.description}</p>
              </div>
              {!isMobile && (
                <div className="text-left text-sm text-gray-500">
                  {chapter.lessons.length} جلسه
                </div>
              )}
              {isMobile && (
                <div className="text-right text-xs text-gray-500 mt-1">
                  {chapter.lessons.length} جلسه
                </div>
              )}
            </div>
            
            {/* Lessons List */}
            <div className="space-y-2">
              {chapter.lessons.slice(0, 3).map((lesson) => (
                <div key={lesson.id} className={`flex justify-between items-center ${isMobile ? 'p-2' : 'p-3'} bg-gray-50 rounded`}>
                  <div className="text-right flex-1">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>{lesson.title}</span>
                    {lesson.is_free_preview && (
                      <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-green-600 mr-2`}>(پیش‌نمایش رایگان)</span>
                    )}
                  </div>
                  <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>
                    <Clock size={isMobile ? 10 : 12} className="ml-1" />
                    {lesson.duration} دقیقه
                  </div>
                </div>
              ))}
              
              {chapter.lessons.length > 3 && (
                <div className={`text-center ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 py-2`}>
                  و {chapter.lessons.length - 3} درس دیگر...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CourseChaptersList;
