import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Bookmark, BookmarkCheck, Clock, BarChart, User, FileText, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, myCourses, bookmarks, addBookmark, removeBookmark, comments, addComment, enrollCourse, wallet, updateWallet } = useData();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [shortfall, setShortfall] = useState(0);

  // Check for pending course purchase after wallet recharge
  useEffect(() => {
    const pendingCourseId = localStorage.getItem("pendingCourseId");
    
    // If we're on a course page and there's a pending purchase for this course
    if (pendingCourseId && id === pendingCourseId && user && wallet && courses) {
      const course = courses.find(c => c.id === id);
      
      // If course exists and user has enough balance now, complete the purchase
      if (course && wallet.balance >= course.price) {
        const newTransaction = {
          id: Date.now().toString(),
          amount: course.price,
          type: "purchase" as const,
          description: `خرید دوره ${course.title}`,
          date: new Date().toLocaleDateString("fa-IR"),
        };

        updateWallet(wallet.balance - course.price, [...wallet.transactions, newTransaction]);
        enrollCourse(course.id, user.id);

        toast({
          title: "خرید موفق",
          description: `دوره ${course.title} با موفقیت خریداری شد`,
        });
        
        // Clear the pending purchase
        localStorage.removeItem("pendingCourseId");
        
        // Redirect to my courses
        navigate("/my-courses");
      }
    }
  }, [id, user, wallet, courses, enrollCourse, updateWallet, navigate]);

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

  // Sample lesson sections (this would come from API in a real app)
  const lessonSections = [
    {
      title: "فصل اول: ذهنیت ثروت ساز",
      lessons: [
        { title: "مقدمه", duration: "10 دقیقه", isComplete: true, isLocked: false },
        { title: "اصول ذهنیت ثروت ساز", duration: "15 دقیقه", isComplete: true, isLocked: false },
        { title: "تمرین های ذهنی", duration: "20 دقیقه", isComplete: false, isLocked: false },
      ]
    },
    {
      title: "فصل دوم: مهارت‌های ثروت ساز",
      lessons: [
        { title: "شناخت فرصت‌ها", duration: "18 دقیقه", isComplete: false, isLocked: !isEnrolled },
        { title: "مدیریت ریسک", duration: "22 دقیقه", isComplete: false, isLocked: !isEnrolled },
      ]
    },
    {
      title: "فصل سوم: فعالیت‌های ثروت ساز",
      lessons: [
        { title: "پروژه عملی", duration: "30 دقیقه", isComplete: false, isLocked: !isEnrolled },
        { title: "تحلیل موردی", duration: "25 دقیقه", isComplete: false, isLocked: !isEnrolled },
      ]
    }
  ];

  // Course info (this would come from API in a real app)
  const courseInfo = {
    sectionCount: 5,
    filesCount: 25,
    hoursCount: 7,
    prerequisites: [
      "آشنایی مقدماتی با مفاهیم اقتصادی",
      "علاقه به یادگیری مهارت‌های کسب و کار"
    ],
    audience: [
      "علاقمندان به کسب درآمد و ثروت",
      "کارآفرینان و صاحبان کسب و کار",
      "افرادی که به دنبال استقلال مالی هستند"
    ]
  };

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

  const handlePurchase = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (course?.price === 0 || isEnrolled) {
      // Free course or already enrolled
      enrollCourse(course!.id, user.id);
      navigate("/my-courses");
      return;
    }

    if (!wallet || wallet.balance < course.price) {
      // Calculate how much more money is needed
      const calculatedShortfall = course.price - (wallet?.balance || 0);
      setShortfall(calculatedShortfall);
      
      // Store course ID in localStorage to complete purchase after recharge
      localStorage.setItem("pendingCourseId", course.id);
      
      // Open purchase dialog with recharge option
      setIsPurchaseDialogOpen(true);
      return;
    }

    // Sufficient balance, open regular purchase dialog
    setIsPurchaseDialogOpen(true);
  };

  const handleConfirmPurchase = () => {
    if (!user || !course || !wallet) return;

    // If balance is insufficient, redirect to wallet page
    if (wallet.balance < course.price) {
      setIsPurchaseDialogOpen(false);
      navigate("/wallet");
      return;
    }

    // Process purchase
    const newTransaction = {
      id: Date.now().toString(),
      amount: course.price,
      type: "purchase" as const,
      description: `خرید دوره ${course.title}`,
      date: new Date().toLocaleDateString("fa-IR"),
    };

    updateWallet(wallet.balance - course.price, [...wallet.transactions, newTransaction]);
    enrollCourse(course.id, user.id);

    toast({
      title: "خرید موفق",
      description: `دوره ${course.title} با موفقیت خریداری شد`,
    });

    setIsPurchaseDialogOpen(false);
    navigate("/my-courses");
  };

  const handleRechargeWallet = () => {
    // Store course ID in localStorage to complete purchase after recharge
    localStorage.setItem("pendingCourseId", course.id);
    setIsPurchaseDialogOpen(false);
    navigate("/wallet");
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

  const levelTranslation = {
    "beginner": "مقدماتی",
    "intermediate": "متوسط",
    "advanced": "پیشرفته"
  };

  const getPurchaseButtonText = () => {
    if (isEnrolled) {
      return "مشاهده دوره";
    }

    if (course.price === 0) {
      return "ثبت‌نام رایگان در دوره";
    }

    return "خرید دوره";
  };

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="w-full h-96 bg-gradient-to-r from-amber-800 to-amber-600 overflow-hidden relative">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover opacity-25 absolute inset-0"
        />
        <div className="trader-container h-full flex flex-col justify-center items-start relative z-10 py-8 px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h5 className="text-white text-xl mb-2">
              {course.categories && course.categories[0]}
            </h5>
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">
              {course.title}
            </h1>
            <p className="text-white/90 text-lg mb-6 line-clamp-2">
              {course.description}
            </p>
            <div className="flex items-center gap-6 text-white/90">
              <div className="flex items-center gap-1">
                <User className="h-5 w-5" />
                <span>{course.instructor}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-300" />
                <span>{course.rating} (از {courseComments.length} نظر)</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-5 w-5" />
                <span>{course.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="trader-container py-8 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="content">محتوای دوره</TabsTrigger>
                <TabsTrigger value="about">درباره دوره</TabsTrigger>
                <TabsTrigger value="comments">نظرات کاربران</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="border rounded-xl p-5">
                <h2 className="text-xl font-bold mb-4">سرفصل‌ها</h2>
                <Accordion type="single" collapsible className="w-full">
                  {lessonSections.map((section, index) => (
                    <AccordionItem key={index} value={`section-${index}`}>
                      <AccordionTrigger className="text-right">
                        <div className="flex w-full justify-between items-center">
                          <span>{section.title}</span>
                          <span className="text-sm text-gray-500">{section.lessons.length} جلسه</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-3">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <li 
                              key={lessonIndex}
                              className={`flex justify-between items-center p-2 rounded-lg ${lesson.isComplete ? 'bg-green-50' : lesson.isLocked ? 'bg-gray-50' : 'bg-white'}`}
                            >
                              <div className="flex items-center">
                                {lesson.isComplete ? (
                                  <div className="h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center mr-2">✓</div>
                                ) : lesson.isLocked ? (
                                  <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center mr-2">🔒</div>
                                ) : (
                                  <div className="h-5 w-5 rounded-full border border-gray-300 mr-2"></div>
                                )}
                                <span className={lesson.isLocked ? "text-gray-400" : ""}>{lesson.title}</span>
                              </div>
                              <span className="text-sm text-gray-500">{lesson.duration}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="about" className="border rounded-xl p-5">
                <h2 className="text-xl font-bold mb-4">درباره دوره</h2>
                <div className="prose max-w-none">
                  <p className="mb-6 leading-7 text-gray-700">{course.description}</p>

                  <h3 className="text-lg font-bold mt-6 mb-3">پیش‌نیازها</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {courseInfo.prerequisites.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>

                  <h3 className="text-lg font-bold mt-6 mb-3">مخاطبان دوره</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {courseInfo.audience.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="comments" className="border rounded-xl p-5">
                <h2 className="text-xl font-bold mb-4">نظرات کاربران</h2>
                
                {user && (
                  <form onSubmit={handleSubmitComment} className="mb-8 bg-gray-50 p-4 rounded-lg">
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
                    
                    <Button type="submit" className="trader-btn-primary">
                      ثبت نظر
                    </Button>
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
                              {comment.date}
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
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <span className="font-bold text-lg">
                        {course.price === 0 
                          ? "رایگان" 
                          : `${course.price.toLocaleString()} تومان`}
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
                  
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-xl font-bold text-orange-500">{courseInfo.sectionCount}</p>
                      <p className="text-gray-600 text-xs">سرفصل</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-xl font-bold text-orange-500">{courseInfo.filesCount}</p>
                      <p className="text-gray-600 text-xs">فایل آموزشی</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-xl font-bold text-orange-500">{courseInfo.hoursCount}</p>
                      <p className="text-gray-600 text-xs">ساعت آموزش</p>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full bg-trader-500 hover:bg-trader-600 py-3 mb-4 flex items-center justify-center"
                    onClick={handlePurchase}
                  >
                    {!isEnrolled && <ShoppingCart className="ml-2 h-5 w-5" />}
                    {getPurchaseButtonText()}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      پشتیبانی و دسترسی مادام العمر
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-5 mt-4">
                <h3 className="text-lg font-bold mb-3">اطلاعات دوره</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">مدرس:</span>
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">سطح دوره:</span>
                    <span>
                      {course.level ? levelTranslation[course.level] : "نامشخص"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">تاریخ بروزرسانی:</span>
                    <span>{new Date(course.updatedAt).toLocaleDateString("fa-IR")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأیید خرید دوره</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">{course.title}</h3>
              <p className="text-gray-600">{course.instructor}</p>
            </div>
            
            <div className="flex justify-between items-center border-t border-b py-3 my-4">
              <span className="font-medium">قیمت دوره:</span>
              <span className="font-bold text-trader-500">{course.price.toLocaleString()} تومان</span>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">مبلغ از کیف پول شما کسر خواهد شد.</p>
              <p className="text-sm font-medium mt-2">
                موجودی کیف پول: <span className="font-bold">{wallet?.balance.toLocaleString()} تومان</span>
              </p>
              
              {wallet && wallet.balance < course.price && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-red-600 font-medium">موجودی کیف پول شما کافی نیست.</p>
                  <p className="text-sm text-red-500 mt-1">
                    برای خرید این دوره نیاز به افزایش موجودی به مبلغ <span className="font-bold">{shortfall.toLocaleString()} تومان</span> دارید.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between gap-2">
            <Button type="button" variant="outline" onClick={() => setIsPurchaseDialogOpen(false)}>
              انصراف
            </Button>
            {wallet && wallet.balance < course.price ? (
              <Button 
                type="button"
                onClick={handleRechargeWallet}
                className="bg-green-600 hover:bg-green-700"
              >
                افزایش موجودی
              </Button>
            ) : (
              <Button 
                type="button"
                onClick={handleConfirmPurchase}
              >
                تأیید و پرداخت
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CourseDetailPage;
