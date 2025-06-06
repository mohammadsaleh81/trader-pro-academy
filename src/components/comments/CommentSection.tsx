
import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, MessageCircle, Edit2, Reply } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { api, ArticleComment, MediaComment } from "@/lib/api";

export interface Comment {
  id: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    thumbnail?: string;
    username?: string;
    email?: string;
  };
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    username?: string;
    email?: string;
    thumbnail?: string;
  };
  content: string;
  created_at: string;
  replies?: Comment[];
  parent?: string | null;
}

interface CommentSectionProps {
  contentType: "article" | "video" | "podcast";
  contentId: string;
  comments?: Comment[];
  onCommentAdd?: (comment: Comment) => void;
  onCommentDelete?: (commentId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  contentType,
  contentId,
  comments: propComments = [],
  onCommentAdd,
  onCommentDelete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Transform API response to local comment format
  const transformComment = (apiComment: ArticleComment | MediaComment): Comment => {
    return {
      id: apiComment.id,
      author: apiComment.author,
      content: apiComment.content,
      created_at: apiComment.created_at,
      parent: apiComment.parent,
      replies: apiComment.replies?.map(reply => transformComment(reply)) || []
    };
  };

  // Load comments from API
  const loadComments = async () => {
    try {
      setIsLoading(true);
      let apiComments: (ArticleComment | MediaComment)[] = [];

      switch (contentType) {
        case 'article':
          apiComments = await api.getArticleComments(contentId);
          break;
        case 'video':
          apiComments = await api.getVideoComments(contentId);
          break;
        case 'podcast':
          apiComments = await api.getPodcastComments(contentId);
          break;
        default:
          apiComments = [];
      }

      const transformedComments = apiComments.map(transformComment);
      setComments(transformedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: "خطا در بارگذاری نظرات",
        description: "لطفا دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [contentType, contentId]);

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
      let newApiComment: ArticleComment | MediaComment;
      const commentData = {
        content: newComment,
        parent: replyTo
      };

      switch (contentType) {
        case 'article':
          newApiComment = await api.createArticleComment(contentId, commentData);
          break;
        case 'video':
          newApiComment = await api.createVideoComment(contentId, commentData);
          break;
        case 'podcast':
          newApiComment = await api.createPodcastComment(contentId, commentData);
          break;
        default:
          throw new Error('نوع محتوای نامعلوم');
      }

      const newComment_transformed = transformComment(newApiComment);
      
      // Add to local state
      if (replyTo) {
        // Add as reply
        setComments(prev => prev.map(comment => {
          if (comment.id === replyTo) {
            return {
              ...comment,
              replies: [newComment_transformed, ...(comment.replies || [])]
            };
          }
          return comment;
        }));
      } else {
        // Add as new top-level comment
        setComments(prev => [newComment_transformed, ...prev]);
      }

      setNewComment("");
      setReplyTo(null);
      
      if (onCommentAdd) {
        onCommentAdd(newComment_transformed);
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

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast({
        title: "نظر خالی",
        description: "لطفا متن نظر خود را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.updateMediaComment(commentId, editContent);
      
      // Update local state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content: editContent };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply.id === commentId ? { ...reply, content: editContent } : reply
            )
          };
        }
        return comment;
      }));

      setEditingComment(null);
      setEditContent("");

      toast({
        title: "نظر ویرایش شد",
        description: "نظر با موفقیت ویرایش شد",
      });
    } catch (error) {
      console.error('Error editing comment:', error);
      toast({
        title: "خطا در ویرایش نظر",
        description: "لطفا دوباره تلاش کنید",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.deleteMediaComment(commentId);
      
      // Remove from local state
      setComments(prev => prev.filter(comment => {
        if (comment.id === commentId) return false;
        if (comment.replies) {
          comment.replies = comment.replies.filter(reply => reply.id !== commentId);
        }
        return true;
      }));
      
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

  const getUserInitials = (comment: Comment) => {
    const author = comment.author || comment.user;
    if (!author) return '??';
    return `${author.first_name?.charAt(0) || ''}${author.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  const getUserName = (comment: Comment) => {
    const author = comment.author || comment.user;
    if (!author) return 'کاربر ناشناس';
    const fullName = `${author.first_name || ''} ${author.last_name || ''}`.trim();
    return fullName || author.username || author.email || 'کاربر';
  };

  const getUserThumbnail = (comment: Comment) => {
    const author = comment.author || comment.user;
    return author?.thumbnail;
  };

  const canDeleteComment = (comment: Comment) => {
    const author = comment.author || comment.user;
    return user && author && user.id === author.id;
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const startReply = (commentId: string) => {
    setReplyTo(commentId);
    setNewComment("");
  };

  const cancelReply = () => {
    setReplyTo(null);
    setNewComment("");
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <Card key={comment.id} className={`${isReply ? 'mr-8 border-r-2 border-orange-200' : 'border-l-4 border-trader-200'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getUserThumbnail(comment)} />
              <AvatarFallback className="bg-trader-100 text-trader-700">
                {getUserInitials(comment)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {getUserName(comment)}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(comment.created_at)}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startReply(comment.id)}
                className="text-gray-500 hover:text-trader-600"
              >
                <Reply className="h-4 w-4" />
              </Button>
            )}
            {canDeleteComment(comment) && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(comment)}
                  className="text-gray-500 hover:text-blue-600"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        
        {editingComment === comment.id ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px] text-right"
              dir="rtl"
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                onClick={() => handleEditComment(comment.id)}
                className="bg-trader-500 hover:bg-trader-600"
              >
                ذخیره
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelEdit}
              >
                لغو
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 leading-relaxed text-right" dir="rtl">
            {comment.content}
          </p>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-trader-500" />
          <h3 className="text-lg font-semibold">در حال بارگذاری نظرات...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-trader-500" />
        <h3 className="text-lg font-semibold">
          نظرات ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {replyTo && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>در پاسخ به نظر</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelReply}
                  >
                    لغو پاسخ
                  </Button>
                </div>
              )}
              <Textarea
                placeholder={replyTo ? "پاسخ خود را بنویسید..." : "نظر خود را بنویسید..."}
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
                  {isSubmitting ? "در حال ثبت..." : replyTo ? "ثبت پاسخ" : "ثبت نظر"}
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
        {comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">هنوز نظری ثبت نشده است</p>
              <p className="text-sm text-gray-400 mt-1">اولین نفری باشید که نظر می‌دهد!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
