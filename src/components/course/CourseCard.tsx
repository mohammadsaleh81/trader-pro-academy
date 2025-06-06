import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Loader, Wallet, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ProgressBar from "@/components/ui/progress-bar";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "@/hooks/use-toast";
import { clearPendingCourse } from "@/lib/cache";
import api from "@/lib/axios";

type CourseCardProps = {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  price: number;
  rating: number;
  progress?: number;
  isFree?: boolean;
  is_enrolled?: boolean;
};

const CourseCard: React.FC<CourseCardProps> = React.memo(({
  id,
  title,
  instructor,
  thumbnail,
  price,
  rating,
  progress,
  isFree = false,
  is_enrolled
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myCourses, wallet, enrollCourse } = useData();
  const { refetchWallet } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  
  const isEnrolled = is_enrolled || false;

  // Helper function for formatting currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const formatCurrencyWithUnit = (amount: number): string => {
    return `${formatCurrency(amount)} تومان`;
  };

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

        // Refresh wallet to show updated balance
        refetchWallet();

        navigate(`/learn/${id}`);
      }
    } catch (error: any) {
      console.error('Error processing purchase:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMsg = "خطا در پردازش خرید";
        
        if (errorData?.course_id?.[0]) {
          errorMsg = errorData.course_id[0];
        } else if (errorData?.non_field_errors?.[0]) {
          errorMsg = errorData.non_field_errors[0];
        } else if (errorData?.detail) {
          errorMsg = errorData.detail;
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

            navigate(`/learn/${id}`);
          }
        } catch (error: any) {
          console.error('Error processing free enrollment:', error);
          
          if (error.response?.status === 400 || error.response?.status === 409) {
            toast({
              title: "خطا",
              description: "شما قبلاً در این دوره ثبت‌نام کرده‌اید",
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
          description: `برای خرید این دوره نیاز به ${shortfall.toLocaleString()} تومان شارژ اضافی دارید`,
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
  }, [user, isFree, isEnrolled, wallet, price, id, title, navigate, enrollCourse]);

  const handleImageError = React.useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/placeholder-course.jpg";
  }, []);

  console.log(is_enrolled);

  return (
    <div className="trader-card h-full flex flex-col min-h-[280px]">
      <Link to={isEnrolled ? `/learn/${id}` : `/courses/${id}`} className="block">
        <div className="relative h-40 w-full">
          <img
            src={thumbnail || "/placeholder-course.jpg"}
            alt={title}
            className="w-full h-full object-cover rounded-t-xl"
            onError={handleImageError}
            loading="lazy"
          />
          {isEnrolled && progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-3">
              <ProgressBar 
                percentage={progress}
                height="sm"
                color="bg-orange-500"
                backgroundColor="bg-white/30"
                className="mb-1"
              />
              <p className="text-white text-xs text-center font-medium">
                {progress}% تکمیل شده
              </p>
            </div>
          )}
        </div>
      </Link>
      <div className="p-3 flex-1 flex flex-col">
        <Link to={isEnrolled ? `/learn/${id}` : `/courses/${id}`} className="block">
          <h3 className="font-bold text-sm line-clamp-2 mb-1 min-h-[2.5rem]">{title}</h3>
          <p className="text-gray-600 text-xs mb-2">مدرس: {instructor}</p>
        </Link>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div></div>
            {!isEnrolled && (
              <p className={`font-bold ${isFree ? "text-green-600" : "text-trader-500"} text-sm`}>
                {isFree ? "رایگان" : `${price.toLocaleString()} تومان`}
              </p>
            )}
            {isEnrolled && (
              <p className="font-bold text-green-600 text-sm">
                ادامه یادگیری
              </p>
            )}
          </div>
          <Button 
            variant={isEnrolled ? "outline" : "default"}
            className={`w-full text-xs py-2 h-8 ${isEnrolled ? 'border-green-500 text-green-600 hover:bg-green-50' : ''}`}
            onClick={handleQuickBuy}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              <>
                {!isEnrolled && <ShoppingCart className="h-4 w-4 ml-1" />}
                {isEnrolled ? "ادامه یادگیری" : isFree ? "ثبت‌نام رایگان" : "خرید سریع"}
              </>
            )}
          </Button>
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
                </div>
              </div>
            </div>

            {/* Purchase Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-blue-600 ml-2" />
                  <span className="text-blue-800">مبلغ دوره:</span>
                </div>
                <span className="font-bold text-blue-600">{formatCurrencyWithUnit(price)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 text-green-600 ml-2" />
                  <span className="text-green-800">موجودی فعلی شما:</span>
                </div>
                <span className="font-bold text-green-600">{formatCurrencyWithUnit(wallet?.balance || 0)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-orange-600 ml-2" />
                  <span className="text-orange-800">موجودی پس از خرید:</span>
                </div>
                <span className="font-bold text-orange-600">
                  {formatCurrencyWithUnit((wallet?.balance || 0) - price)}
                </span>
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-center">
                مبلغ <span className="font-bold">{formatCurrencyWithUnit(price)}</span> از کیف پول شما 
                برای خرید دوره <span className="font-bold">"{title}"</span> کم می‌شود.
              </p>
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
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.instructor === nextProps.instructor &&
    prevProps.thumbnail === nextProps.thumbnail &&
    prevProps.price === nextProps.price &&
    prevProps.rating === nextProps.rating &&
    prevProps.progress === nextProps.progress &&
    prevProps.isFree === nextProps.isFree &&
    prevProps.is_enrolled === nextProps.is_enrolled
  );
});

CourseCard.displayName = 'CourseCard';

export default CourseCard;
