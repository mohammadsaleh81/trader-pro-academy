import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Loader, Wallet, CheckCircle, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ProgressBar from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "@/hooks/use-toast";
import { clearPendingCourse } from "@/lib/cache";
import { formatCurrency, formatPrice } from "@/utils/currency";
import api from "@/lib/axios";
import { notificationService } from "@/lib/notification-service";
import { checkIdentityVerificationForPurchase, getCapacityStatus, canPurchaseCourse } from "@/lib/utils";

type CourseCardProps = {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  price: number;
  progress?: number;
  isFree?: boolean;
  is_enrolled?: boolean;
  discounted_price?: number;
  discount_percentage?: number;
  requires_identity_verification?: boolean;
  has_capacity_limit?: boolean;
  capacity?: number;
  available_spots?: number;
  is_full?: boolean;
  student_count?: number;
};

const CourseCard: React.FC<CourseCardProps> = React.memo((props) => {
  const {
    id,
    title,
    instructor,
    thumbnail,
    price,
    progress,
    isFree = false,
    is_enrolled,
    discounted_price,
    discount_percentage,
    requires_identity_verification,
    has_capacity_limit,
    capacity,
    available_spots,
    is_full,
    student_count
  } = props;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myCourses, wallet, enrollCourse } = useData();
  const { refetchWallet } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  
  const isEnrolled = is_enrolled || false;
  const capacityStatus = getCapacityStatus({ has_capacity_limit, capacity, available_spots, is_full });
  const canPurchase = canPurchaseCourse({ has_capacity_limit, is_full });

  const handlePurchaseConfirm = async () => {
    setShowPurchaseConfirm(false);
    setIsProcessing(true);

    try {
      const enrollResponse = await api.post(`/crs/courses/${id}/enroll/`, {
        course_id: parseInt(id)
      });

      if (enrollResponse.status === 201) {
        clearPendingCourse();
        enrollCourse(id);

        toast({
          title: "خرید موفق",
          description: `دوره ${title} با موفقیت خریداری شد`,
        });

        // ارسال notification برای خرید موفق دوره
        try {
          await notificationService.sendCoursePurchaseNotification(title, id);
          console.log('Course purchase notification sent successfully');
        } catch (notificationError) {
          console.warn('Failed to send course purchase notification:', notificationError);
        }

        // Refresh wallet to show updated balance
        refetchWallet();

        navigate(`/learn/${id}`);
      }
    } catch (error: any) {
      console.error('Error processing purchase:', error);
      
      // Handle specific enrollment errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMsg = "خطا در پردازش خرید";
        
        if (errorData?.non_field_errors?.[0]) {
          errorMsg = errorData.non_field_errors[0];
        } else if (errorData?.course_id?.[0]) {
          errorMsg = errorData.course_id[0];
        } else if (errorData?.detail) {
          errorMsg = errorData.detail;
        } else if (errorData?.message) {
          errorMsg = errorData.message;
        }
        
        toast({
          title: "خطا در خرید",
          description: errorMsg,
          variant: "destructive",
        });
      } else if (error.response?.status === 402) {
        toast({
          title: "موجودی ناکافی",
          description: "موجودی کیف پول شما برای خرید این دوره کافی نیست",
          variant: "destructive",
        });
        localStorage.setItem("pendingCourseId", id);
        navigate("/wallet");
      } else if (error.response?.status === 409) {
        toast({
          title: "خطا",
          description: "شما قبلاً در این دوره ثبت‌نام کرده‌اید",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطا",
          description: "خطا در پردازش خرید. لطفاً دوباره تلاش کنید.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickBuy = React.useCallback(async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to course detail
    setIsProcessing(true);
    
    try {
      if (!user) {
        navigate("/login");
        return;
      }

      if (isEnrolled) {
        navigate(`/learn/${id}`);
        return;
      }

      // Check capacity before proceeding
      if (!canPurchase) {
        toast({
          title: "ظرفیت تکمیل شده",
          description: "ظرفیت این دوره تکمیل شده است. لطفاً دوره‌های دیگر را بررسی کنید.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Check identity verification requirements
      if (!checkIdentityVerificationForPurchase(
        { requires_identity_verification: requires_identity_verification, title: title },
        user,
        navigate,
        toast
      )) {
        setIsProcessing(false);
        return;
      }

      // For free courses, just enroll directly
      if (isFree || price === 0) {
        try {
          const enrollResponse = await api.post(`/crs/courses/${id}/enroll/`, {
            course_id: parseInt(id)
          });

          if (enrollResponse.status === 201) {
            clearPendingCourse();
            enrollCourse(id);
            
            toast({
              title: "ثبت‌نام موفق",
              description: `شما با موفقیت در دوره ${title} ثبت‌نام شدید`,
            });

            // ارسال notification برای ثبت‌نام موفق در دوره رایگان
            try {
              await notificationService.sendCourseEnrollmentNotification(title, id);
              console.log('Course enrollment notification sent successfully');
            } catch (notificationError) {
              console.warn('Failed to send course enrollment notification:', notificationError);
            }

            navigate(`/learn/${id}`);
          }
        } catch (error: any) {
          console.error('Error processing free enrollment:', error);
          
          if (error.response?.status === 400 || error.response?.status === 409) {
            const errorData = error.response.data;
            let errorMsg = "شما قبلاً در این دوره ثبت‌نام کرده‌اید";
            
            if (errorData?.non_field_errors?.[0]) {
              errorMsg = errorData.non_field_errors[0];
            }
            
            toast({
              title: "خطا",
              description: errorMsg,
              variant: "destructive",
            });
          } else {
            toast({
              title: "خطا",
              description: "خطا در پردازش ثبت‌نام. لطفاً دوباره تلاش کنید.",
              variant: "destructive",
            });
          }
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      // For paid courses, check wallet balance
      if (!wallet || wallet.balance < price) {
        const shortfall = price - (wallet?.balance || 0);
        
        toast({
          title: "موجودی ناکافی",
          description: `برای خرید این دوره نیاز به ${formatCurrency(shortfall)} شارژ اضافی دارید`,
          variant: "destructive",
        });
        
        // Store course ID in localStorage to complete purchase after recharge
        localStorage.setItem("pendingCourseId", id);
        navigate("/wallet");
        return;
      }

      // Show confirmation dialog
      setIsProcessing(false);
      setShowPurchaseConfirm(true);

    } catch (error) {
      console.error('Error in handleQuickBuy:', error);
      
      toast({
        title: "خطا",
        description: "خطا در پردازش درخواست. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  }, [user, isFree, isEnrolled, wallet, price, id, title, navigate, enrollCourse, requires_identity_verification, canPurchase]);

  const handleImageError = React.useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/placeholder-course.jpg";
  }, []);

  console.log('CourseCard Debug:', { 
    id, 
    title, 
    price, 
    isFree, 
    is_enrolled,
    discounted_price,
    discount_percentage,
    hasDiscount: discount_percentage && discount_percentage > 0
  });

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 w-full max-w-md mx-auto min-h-[340px] sm:min-h-[380px] flex flex-col">
        {/* Course Image */}
        <Link to={`/courses/${id}`} className="block">
          <div className="relative">
            <div className="w-full aspect-[5/3] bg-gray-100 rounded-t-xl flex items-center justify-center overflow-hidden">
              <img
                src={thumbnail || "/placeholder-course.jpg"}
                alt={title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {isEnrolled && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-md">
                  <CheckCircle className="h-3 w-3 ml-1" />
                  ثبت‌نام شده
                </Badge>
              </div>
            )}
            {requires_identity_verification && !isEnrolled && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 text-xs px-2 py-0.5 rounded-md">
                  <Shield className="h-3 w-3 ml-1" />
                  احراز هویت
                </Badge>
              </div>
            )}
            {/* Capacity Status Badge */}
            {has_capacity_limit && (
              <div className="absolute bottom-2 left-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-0.5 rounded-md ${
                    capacityStatus.color === 'red' 
                      ? 'bg-red-100 text-red-800 border-red-200' 
                      : capacityStatus.color === 'orange'
                      ? 'bg-orange-100 text-orange-800 border-orange-200'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                >
                  <Users className="h-3 w-3 ml-1" />
                  {capacityStatus.text}
                </Badge>
              </div>
            )}
          </div>
        </Link>

        {/* Course Content */}
        <div className="p-1.5 flex flex-col flex-grow">
          <Link to={`/courses/${id}`} className="block">
            <h3 className="font-bold text-sm mb-1 text-gray-800 hover:text-trader-600 transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-gray-600 text-xs mb-1 line-clamp-1">مدرس: {instructor}</p>
          </Link>

          {/* Progress Bar for Enrolled Courses */}
          {isEnrolled && progress !== undefined && (
            <div className="mb-1">
              <div className="flex justify-between text-[11px] text-gray-600 mb-0.5">
                <span>پیشرفت</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar percentage={progress} height="sm" className="h-1.5" />
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-center justify-between mb-1 min-h-[22px]">
            <div className="flex items-center flex-wrap gap-1">
              <Wallet className="h-3 w-3 text-gray-500 ml-1" />
              {isFree ? (
                <>
                  <span className="text-green-600 font-bold text-xs">رایگان</span>
                  {/* Placeholder for price/discount to keep height equal */}
                  <span className="invisible text-xs">---</span>
                </>
              ) : (
                <div className="flex items-center gap-1">
                  {discounted_price ? (
                    <>
                      <span className="text-gray-400 line-through text-xs">
                        {formatPrice(price)}
                      </span>
                      <span className="text-trader-600 font-bold text-xs">
                        {formatPrice(discounted_price)}
                      </span>
                      {discount_percentage && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5">
                          {discount_percentage}% تخفیف
                        </Badge>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-trader-600 font-bold text-xs">
                        {formatPrice(price)}
                      </span>
                      {/* Placeholder for discount badge to keep height equal */}
                      <span className="invisible text-xs">---</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Capacity Information */}
          {has_capacity_limit && (
            <div className="mb-1 p-1 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-600">ظرفیت دوره:</span>
                <span className={`font-medium ${
                  capacityStatus.color === 'red' 
                    ? 'text-red-600' 
                    : capacityStatus.color === 'orange'
                    ? 'text-orange-600'
                    : 'text-blue-600'
                }`}>
                  {capacityStatus.text}
                </span>
              </div>
              {capacity && available_spots !== undefined && (
                <div className="mt-0.5">
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>دانشجویان: {student_count || (capacity - available_spots)}</span>
                    <span>کل: {capacity}</span>
                  </div>
                  <div className="mt-0.5 bg-gray-200 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full ${
                        capacityStatus.color === 'red' 
                          ? 'bg-red-500' 
                          : capacityStatus.color === 'orange'
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${((capacity - available_spots) / capacity) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-auto">
            <Button 
              variant={isEnrolled ? "outline" : "default"}
              className={`w-full text-xs py-1 h-7 ${
                isEnrolled 
                  ? 'border-green-500 text-green-600 hover:bg-green-50' 
                  : isFree 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-trader-600 hover:bg-trader-700 text-white'
              }`}
              onClick={handleQuickBuy}
              disabled={isProcessing || (!isEnrolled && !canPurchase)}
            >
              {isProcessing ? (
                <Loader className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                <>
                  {!isEnrolled && <ShoppingCart className="h-4 w-4 ml-1" />}
                  {isEnrolled 
                    ? "ادامه یادگیری" 
                    : !canPurchase 
                      ? "ظرفیت تکمیل شده"
                      : isFree 
                        ? "ثبت‌نام در دوره رایگان" 
                        : "خرید سریع"
                  }
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={showPurchaseConfirm} onOpenChange={setShowPurchaseConfirm}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-center">تأیید خرید دوره</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* Course Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <img
                  src={thumbnail || "/placeholder-course.jpg"}
                  alt={title}
                  className="w-16 h-16 object-cover rounded-lg ml-4"
                />
                <div>
                  <h3 className="font-bold text-lg">{title}</h3>
                  <p className="text-gray-600 text-sm">مدرس: {instructor}</p>
                  {requires_identity_verification && (
                    <div className="flex items-center mt-1">
                      <Shield className="h-4 w-4 text-amber-600 ml-1" />
                      <span className="text-amber-600 text-sm">نیاز به احراز هویت</span>
                    </div>
                  )}
                  {/* Capacity Info in Dialog */}
                  {has_capacity_limit && (
                    <div className="flex items-center mt-1">
                      <Users className="h-4 w-4 text-blue-600 ml-1" />
                      <span className={`text-sm ${
                        capacityStatus.color === 'red' 
                          ? 'text-red-600' 
                          : capacityStatus.color === 'orange'
                          ? 'text-orange-600'
                          : 'text-blue-600'
                      }`}>
                        {capacityStatus.text}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Purchase Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">قیمت دوره:</span>
                <span className="font-bold text-lg">
                  {isFree ? "رایگان" : formatPrice(price)}
                </span>
              </div>
              
              {wallet && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">موجودی کیف پول:</span>
                  <span className="font-bold">{formatCurrency(wallet.balance)}</span>
                </div>
              )}
              
              {!isFree && wallet && (
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">موجودی پس از خرید:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(wallet.balance - price)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowPurchaseConfirm(false)}
            >
              انصراف
            </Button>
            <Button 
              type="submit" 
              onClick={handlePurchaseConfirm}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "در حال پردازش..." : "تأیید و خرید"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.instructor === nextProps.instructor &&
    prevProps.thumbnail === nextProps.thumbnail &&
    prevProps.price === nextProps.price &&
    prevProps.progress === nextProps.progress &&
    prevProps.isFree === nextProps.isFree &&
    prevProps.is_enrolled === nextProps.is_enrolled &&
    prevProps.discounted_price === nextProps.discounted_price &&
    prevProps.discount_percentage === nextProps.discount_percentage &&
    prevProps.requires_identity_verification === nextProps.requires_identity_verification &&
    prevProps.has_capacity_limit === nextProps.has_capacity_limit &&
    prevProps.capacity === nextProps.capacity &&
    prevProps.available_spots === nextProps.available_spots &&
    prevProps.is_full === nextProps.is_full &&
    prevProps.student_count === nextProps.student_count
  );
});

CourseCard.displayName = "CourseCard";

export default CourseCard;
