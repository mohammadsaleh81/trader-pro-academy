
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CourseComment } from "@/types/course";

interface CourseCommentsProps {
  comments: CourseComment[];
}

const CourseComments: React.FC<CourseCommentsProps> = ({ comments }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-right">نظرات دانشجویان</h2>
      
      <div className="space-y-4">
        {comments.slice(0, 5).map((comment) => (
          <Card key={comment.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="text-right">
                  <span className="font-medium">
                    {comment.user.first_name} {comment.user.last_name}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {comment.created_at}
                </div>
              </div>
              <p className="text-gray-700 text-right">{comment.content}</p>
              
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 mr-6 space-y-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">
                          {reply.user.first_name} {reply.user.last_name}
                        </span>
                        <span className="text-xs text-gray-500">{reply.created_at}</span>
                      </div>
                      <p className="text-sm text-gray-700 text-right">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseComments;
