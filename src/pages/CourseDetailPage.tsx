
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Bookmark, BookmarkCheck, Clock, BarChart, User } from "lucide-react";

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, myCourses, bookmarks, addBookmark, removeBookmark, comments, addComment, enrollCourse } = useData();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);

  const course = courses.find(c => c.id === id);
  const isEnrolled = myCourses.some(c => c.id === id);
  
  const bookmark = user && bookmarks.find(
    b => b.itemId === id && b.itemType === "course" && b.userId === user.id
  );
  
  const courseComments = comments.filter(
    c => c.itemId === id && c.itemType === "course"
  );

  if (!course) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <h2 className="text-xl font-bold mb-4">دوره مورد نظر یافت نشد</h2>
        </div>
      </Layout>
    );
  }

  const handleToggleBookmark = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (bookmark) {
      removeBookmark(bookmark.id);
    } else {
      addBookmark(course.id, "course", user.id);
    }
  };

  const handleEnroll = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    enrollCourse(course.id, user.id);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (commentText.trim()) {
      addComment({
        itemId: course.id,
        itemType: "course",
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: commentText,
        rating
      });
      
      setCommentText("");
      setRating(5);
    }
  };

  return (
    <Layout>
      <div className="trader-container py-6">
        {/* Course Banner */}
        <div className="relative h-48 md:h-72 w-full rounded-xl overflow-hidden mb-6">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-white text-2xl md:text-3xl font-bold px-4 text-center">
              {course.title}
            </h1>
          </div>
        </div>
        
        {/* Course Info and Purchase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">درباره دوره</h2>
            <p className="text-gray-700 leading-7 mb-6">
              {course.description}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-3 flex items-center">
                <Clock className="h-5 w-5 text-trader-500 ml-2" />
                <div>
                  <p className="text-xs text-gray-500">مدت زمان</p>
                  <p className="font-medium">{course.duration}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-3 flex items-center">
                <BarChart className="h-5 w-5 text-trader-500 ml-2" />
                <div>
                  <p className="text-xs text-gray-500">سطح</p>
                  <p className="font-medium">
                    {course.level === "beginner" && "مقدماتی"}
                    {course.level === "intermediate" && "متوسط"}
                    {course.level === "advanced" && "پیشرفته"}
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-3 flex items-center">
                <User className="h-5 w-5 text-trader-500 ml-2" />
                <div>
                  <p className="text-xs text-gray-500">مدرس</p>
                  <p className="font-medium">{course.instructor}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 ml-1" />
                <span className="font-bold">{course.rating}</span>
                <span className="text-gray-500 text-sm mr-1">
                  ({courseComments.length} نظر)
                </span>
              </div>
              
              <button
                onClick={handleToggleBookmark}
                className="text-trader-500"
              >
                {bookmark ? (
                  <BookmarkCheck className="h-5 w-5" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <div className="border-t border-b py-4 my-4">
              <h3 className="text-2xl font-bold text-trader-500">
                {course.price.toLocaleString()} تومان
              </h3>
            </div>
            
            {isEnrolled ? (
              <button
                onClick={() => navigate("/my-courses")}
                className="w-full trader-btn-primary py-3"
              >
                مشاهده دوره
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                className="w-full trader-btn-primary py-3"
              >
                ثبت‌نام در دوره
              </button>
            )}
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                {course.totalLessons} جلسه | {course.duration} محتوا
              </p>
            </div>
          </div>
        </div>
        
        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">نظرات کاربران</h2>
          
          {user && (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  نظر خود را بنویسید
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="trader-input"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  امتیاز شما به این دوره
                </label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl ${
                        star <= rating ? "text-yellow-500" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <button type="submit" className="trader-btn-primary">
                ثبت نظر
              </button>
            </form>
          )}
          
          {courseComments.length > 0 ? (
            <div className="space-y-6">
              {courseComments.map((comment) => (
                <div key={comment.id} className="border-b pb-6">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden ml-3">
                      <img
                        src={comment.userAvatar || "https://randomuser.me/api/portraits/men/1.jpg"}
                        alt={comment.userName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{comment.userName}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(comment.date).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                    {comment.rating && (
                      <div className="mr-auto flex items-center">
                        <span className="text-yellow-500 ml-1">{comment.rating}</span>
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              هنوز نظری برای این دوره ثبت نشده است.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetailPage;
