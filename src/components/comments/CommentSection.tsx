
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

export interface Comment {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    thumbnail?: string;
  };
  content: string;
  created_at: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  contentType: "article" | "video" | "course";
  contentId: string;
  comments?: Comment[];
  onCommentAdd?: (comment: Comment) => void;
  onCommentDelete?: (commentId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  contentType,
  contentId,
  comments = [],
  onCommentAdd,
  onCommentDelete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "ورود مورد نیاز",
        description: "برای ثبت نظر ابتدا وارد شوید",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "نظر خالی",
        description: "لطفا متن نظر خود را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a mock comment for now - in real implementation, this would call the API
      const mockComment: Comment = {
        id: Math.random().toString(),
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          thumbnail: user.thumbnail
        },
        content: newComment,
        created_at: new Date().toISOString(),
        replies: []
      };

      setLocalComments(prev => [mockComment, ...prev]);
      setNewComment("");
      
      if (onCommentAdd) {
        onCommentAdd(mockComment);
      }

      toast({
        title: "نظر ثبت شد",
        description: "نظر شما با موفقیت ثبت شد",
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "خطا در ثبت نظر",
        description: "لطفا دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      setLocalComments(prev => prev.filter(comment => comment.id !== commentId));
      
      if (onCommentDelete) {
        onCommentDelete(commentId);
      }

      toast({
        title: "نظر حذف شد",
        description: "نظر با موفقیت حذف شد",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "خطا در حذف نظر",
        description: "لطفا دوباره تلاش کنید",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const canDeleteComment = (comment: Comment) => {
    return user && user.id === comment.user.id;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-trader-500" />
        <h3 className="text-lg font-semibold">
          نظرات ({localComments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Textarea
                placeholder="نظر خود را بنویسید..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] text-right"
                dir="rtl"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-trader-500 hover:bg-trader-600"
                >
                  {isSubmitting ? "در حال ثبت..." : "ثبت نظر"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-gray-600 mb-4">برای ثبت نظر ابتدا وارد شوید</p>
            <Button variant="outline" onClick={() => window.location.href = '/login'}>
              ورود به حساب کاربری
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {localComments.length > 0 ? (
          localComments.map((comment) => (
            <Card key={comment.id} className="border-l-4 border-trader-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.user.thumbnail} />
                      <AvatarFallback className="bg-trader-100 text-trader-700">
                        {getUserInitials(comment.user.first_name, comment.user.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {comment.user.first_name} {comment.user.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  {canDeleteComment(comment) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <p className="text-gray-700 text-right leading-relaxed" dir="rtl">
                  {comment.content}
                </p>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 mr-6 space-y-3 border-r-2 border-gray-100 pr-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={reply.user.thumbnail} />
                              <AvatarFallback className="bg-trader-100 text-trader-700 text-xs">
                                {getUserInitials(reply.user.first_name, reply.user.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {reply.user.first_name} {reply.user.last_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(reply.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          {canDeleteComment(reply) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(reply.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 text-right" dir="rtl">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">هنوز نظری ثبت نشده است</p>
              <p className="text-sm text-gray-400 mt-2">
                اولین نفری باشید که نظر می‌دهد
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
