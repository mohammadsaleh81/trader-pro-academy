
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { CourseChapter } from "@/contexts/DataContext";

interface CourseChaptersListProps {
  chapters: CourseChapter[];
}

const CourseChaptersList: React.FC<CourseChaptersListProps> = ({ chapters }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-right">محتوای دوره</h2>
      
      <div className="space-y-4">
        {chapters.map((chapter, index) => (
          <Card key={chapter.id} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="text-right">
                  <h3 className="text-lg font-semibold mb-2">
                    Chapter {index + 1}: {chapter.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{chapter.description}</p>
                </div>
                <div className="text-left text-sm text-gray-500">
                  {chapter.lessons.length} جلسه
                </div>
              </div>
              
              {/* Lessons List */}
              <div className="space-y-2">
                {chapter.lessons.slice(0, 3).map((lesson) => (
                  <div key={lesson.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div className="text-right">
                      <span className="text-sm font-medium">{lesson.title}</span>
                      {lesson.is_free_preview && (
                        <span className="text-xs text-green-600 mr-2">(پیش‌نمایش رایگان)</span>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock size={12} className="ml-1" />
                      {lesson.duration} دقیقه
                    </div>
                  </div>
                ))}
                
                {chapter.lessons.length > 3 && (
                  <div className="text-center text-sm text-gray-500 py-2">
                    و {chapter.lessons.length - 3} درس دیگر...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseChaptersList;
